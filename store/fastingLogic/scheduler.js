import { useEffect, useRef, useReducer } from "react";
import { EVENT } from "./events";
import { AppState } from "react-native";
import {
  addDaysInTimeZone,
  getScheduleTimeZone,
  startOfDayTs,
  timeStringToZonedTs,
} from "../../util/timezone";

function normalizeWindow(schedule, nowTs = Date.now()) {
  const timeZone = getScheduleTimeZone(schedule);
  const base = new Date(startOfDayTs(nowTs, timeZone));
  let startTs = timeStringToZonedTs(schedule.start, base, timeZone);
  let endTs = timeStringToZonedTs(schedule.end, base, timeZone);

  if (endTs <= startTs) {
    const nextDayBase = addDaysInTimeZone(base, 1, timeZone);
    endTs = timeStringToZonedTs(schedule.end, nextDayBase, timeZone);
  }

  return { startTs, endTs };
}

function stateAndNextBoundary(schedule, nowTs = Date.now()) {
  const { startTs, endTs } = normalizeWindow(schedule, nowTs);
  const timeZone = getScheduleTimeZone(schedule);
  const inEating = nowTs >= startTs && nowTs < endTs;
  const state = inEating ? "eating" : "fasting";

  let nextBoundaryTs;
  if (inEating) {
    nextBoundaryTs = endTs;
  } else {
    nextBoundaryTs =
      nowTs < startTs
        ? startTs
        : addDaysInTimeZone(startTs, 1, timeZone).getTime();
  }

  return { state, nextBoundaryTs };
}

function eventAtBoundary(prevState) {
  return prevState === "eating" ? EVENT.START : EVENT.END;
}

/**
 * Watches the fasting schedule and fires START/END events at each boundary.
 * Also reconciles on mount and on every foreground-return so the app
 * never drifts out of sync with the schedule.
 *
 * onAutoEvent(ts, type, trigger) – called instead of dispatch when provided.
 */
export default function useScheduleBoundaryScheduler(
  schedule,
  events,
  dispatch,
  onAutoEvent
) {
  const timeoutRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const lastEmitRef = useRef({ ts: 0, type: null });
  const reconcileNowRef = useRef(null);
  const armTimerRef = useRef(null);

  function clearTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function armTimer() {
    if (!schedule) return;

    const now = Date.now();
    const { state, nextBoundaryTs } = stateAndNextBoundary(schedule, now);
    const delay = Math.max(0, nextBoundaryTs - now);

    clearTimer();
    timeoutRef.current = setTimeout(() => {
      const before = state;
      const after = stateAndNextBoundary(schedule, Date.now()).state;
      if (before !== after) {
        const type = eventAtBoundary(before);
        const ts = nextBoundaryTs;

        if (
          lastEmitRef.current.ts !== ts ||
          lastEmitRef.current.type !== type
        ) {
          if (onAutoEvent) {
            onAutoEvent(ts, type, "auto");
          } else {
            dispatch({
              type: type === EVENT.START ? "START_FAST" : "END_FAST",
              payload: ts,
              trigger: "auto",
            });
          }
          lastEmitRef.current = { ts, type };
        }
      }

      armTimer();
    }, delay);
  }

  function reconcileNow() {
    if (!schedule) return;
    const now = Date.now();
    const { state } = stateAndNextBoundary(schedule, now);

    const last = Array.isArray(events) && events.length > 0
      ? events[events.length - 1]
      : undefined;
    const isFastingInStore =
      last?.type === EVENT.START || last?.type === "start";
    const shouldBeFasting = state === "fasting";

    if (shouldBeFasting !== isFastingInStore) {
      const type = shouldBeFasting ? EVENT.START : EVENT.END;
      if (onAutoEvent) {
        onAutoEvent(now, type, "auto");
      } else {
        dispatch({
          type: type === EVENT.START ? "START_FAST" : "END_FAST",
          payload: now,
          trigger: "auto",
        });
      }
      lastEmitRef.current = { ts: now, type };
    }
  }

  // Always keep refs current so the once-registered AppState listener
  // calls the latest closure (fresh schedule + events) on foreground-return.
  reconcileNowRef.current = reconcileNow;
  armTimerRef.current = armTimer;

  // Derived key so the effect re-runs when the last event changes
  // (e.g. after midnight rollover or a manual start/stop).
  const lastEventKey =
    Array.isArray(events) && events.length > 0
      ? `${events[events.length - 1].ts}:${events[events.length - 1].type}`
      : "";

  useEffect(() => {
    reconcileNow();
    armTimer();
    return () => clearTimer();
  }, [
    schedule ? schedule.start : undefined,
    schedule ? schedule.end : undefined,
    onAutoEvent,
    lastEventKey,
  ]);

  // Re-arm on foreground return so missed boundaries are corrected immediately.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev.match(/inactive|background/) && next === "active") {
        reconcileNowRef.current?.();
        armTimerRef.current?.();
      }
    });
    return () => sub.remove();
  }, []);
}

export function useUiTicker(periodMs = 250) {
  const tickRef = useRef(0);
  const [, force] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current = Date.now();
      force();
    }, periodMs);
    return () => clearInterval(id);
  }, [periodMs]);
  return tickRef.current;
}

// Returns "eating" or "fasting" at a given timestamp for a given schedule.
export function stateAt(schedule, atTs) {
  const timeZone = getScheduleTimeZone(schedule);
  const base = new Date(startOfDayTs(atTs, timeZone));
  let startTs = timeStringToZonedTs(schedule.start, base, timeZone);
  let endTs = timeStringToZonedTs(schedule.end, base, timeZone);
  if (endTs <= startTs) {
    const nextDayBase = addDaysInTimeZone(base, 1, timeZone);
    endTs = timeStringToZonedTs(schedule.end, nextDayBase, timeZone);
  }
  return atTs >= startTs && atTs < endTs ? "eating" : "fasting";
}
