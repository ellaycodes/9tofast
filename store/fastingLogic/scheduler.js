import { useEffect, useRef, useReducer } from "react";
import { EVENT } from "./events";
import * as dt from "date-fns";
import { AppState } from "react-native";

//helper
function parseHHmmToTs(hhmm, baseDate) {
  return dt.parse(hhmm, "HH:mm", baseDate).getTime();
}

//helper
function normalizeWindow(schedule, nowTs = Date.now()) {
  const base = dt.startOfDay(new Date(nowTs));
  let startTs = parseHHmmToTs(schedule.start, base);
  let endTs = parseHHmmToTs(schedule.end, base);

  // If end is not after start, treat end as next-day
  if (endTs <= startTs) endTs = dt.addDays(new Date(endTs), 1).getTime();

  return { startTs, endTs };
}

//helper
function stateAndNextBoundary(schedule, nowTs = Date.now()) {
  const { startTs, endTs } = normalizeWindow(schedule, nowTs);

  const inEating = nowTs >= startTs && nowTs < endTs;
  const state = inEating ? "eating" : "fasting";

  // Compute the next boundary timestamp
  let nextBoundaryTs;
  if (inEating) {
    nextBoundaryTs = endTs; // eating -> fasting at end
  } else {
    // fasting until next start; if we are after endTs, next start is tomorrow
    const startTodayOrYesterday = startTs; // start for this base day
    nextBoundaryTs =
      nowTs < startTodayOrYesterday
        ? startTodayOrYesterday
        : dt.addDays(new Date(startTodayOrYesterday), 1).getTime();
  }

  return { state, nextBoundaryTs };
}

function eventAtBoundary(prevState) {
  return prevState === "eating" ? EVENT.START : EVENT.END;
}

export default function useScheduleBoundaryScheduler(
  schedule,
  events,
  dispatch,
  anchorTs
) {
  const timeoutRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const lastEmitRef = useRef({ ts: 0, type: null });
  const effectiveAnchor = anchorTs ?? 0;


  // Cancel any pending timeout
  function clearTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function armTimer() {
    if (!schedule) return;
    // if (!anchorTs) return;

    const now = Date.now();
    const { state, nextBoundaryTs } = stateAndNextBoundary(schedule, now);
    // const target = Math.max(nextBoundaryTs, anchorTs);
    const target = Math.max(nextBoundaryTs, effectiveAnchor);
    const delay = Math.max(0, target - now);

    clearTimer();
    timeoutRef.current = setTimeout(() => {
      // Recalculate at fire time for accuracy
      const before = state; // what we computed when arming
      const after = stateAndNextBoundary(schedule, Date.now()).state;
      if (before !== after) {
        const type = eventAtBoundary(before);
        const ts = nextBoundaryTs;

        // Deduplicate by ts+type in case of quick re-arms
        if (
          lastEmitRef.current.ts !== ts ||
          lastEmitRef.current.type !== type
        ) {
          dispatch({
            type: type === EVENT.START ? "START_FAST" : "END_FAST",
            payload: ts,
            trigger: "auto",
          });
          lastEmitRef.current = { ts, type };
        }
      }

      // Always re-arm for the next boundary
      armTimer();
    }, delay);
  }

  // On mount or when schedule changes, ensure state matches current time.
  // If out of sync, emit a corrective event immediately.
  function reconcileNow() {
    // if (!anchorTs || Date.now() < anchorTs) return;
    if (Date.now() < effectiveAnchor) return;
    if (!schedule) return;
    const now = Date.now();
    const { state } = stateAndNextBoundary(schedule, now);

    // Infer current app state from your store using last event in `events`
    const last = events?.at?.(-1);
    const isFastingInStore =
      last?.type === EVENT.START || last?.type === "start";

    const shouldBeFasting = state === "fasting";

    if (shouldBeFasting !== isFastingInStore) {
      // Flip to the correct state right now
      const type = shouldBeFasting ? EVENT.START : EVENT.END;
      dispatch({
        type: type === EVENT.START ? "START_FAST" : "END_FAST",
        payload: now,
        trigger: "auto",
      });
      lastEmitRef.current = { ts: now, type };
    }
  }

  useEffect(() => {
    reconcileNow();
    armTimer();

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule?.start, schedule?.end, effectiveAnchor]);

  // Re-arm when returning to foreground to avoid missing boundaries
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev.match(/inactive|background/) && next === "active") {
        reconcileNow();
        armTimer();
      }
    });
    return () => sub.remove();
  }, []);
}

export function baselineForDay(schedule, nowTs = Date.now()) {
  if (!schedule) return [];
  const dayStart = dt.startOfDay(new Date(nowTs)).getTime();
  const { startTs, endTs } = normalizeWindow(schedule, nowTs);
  const events = [];
  // fasting from midnight until eating start
  events.push({ type: "start", ts: dayStart, trigger: "auto" });
  events.push({ type: "end", ts: startTs, trigger: "auto" });
  // if eating already ended by now, fasting resumes at endTs (which may be today)
  if (endTs < nowTs) events.push({ type: "start", ts: endTs, trigger: "auto" });
  return events;
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

// returns "eating" or "fasting" at a given time
export function stateAt(schedule, atTs) {
  const base = dt.startOfDay(new Date(atTs));
  let startTs = dt.parse(schedule.start, "HH:mm", base).getTime();
  let endTs = dt.parse(schedule.end, "HH:mm", base).getTime();
  if (endTs <= startTs) endTs = dt.addDays(new Date(endTs), 1).getTime();

  const inEating = atTs >= startTs && atTs < endTs;
  return inEating ? "eating" : "fasting";
}

export function baselineSinceAnchor(
  schedule,
  anchorTs,
  nowTs = Date.now(),
  userEvents = []
) {
  if (!schedule || !anchorTs) return [];
  if (nowTs < anchorTs) return [];

  const events = [];
  const initial = stateAt(schedule, anchorTs);

  // seed a synthetic flip at the anchor to set state
  const syntheticType = initial === "fasting" ? EVENT.START : EVENT.END;

  // seed a synthetic flip at the anchor unless user already logged one
  const hasUserEventAtAnchor = userEvents.some(
    (e) => e.ts === anchorTs && e.type === syntheticType
  );
  if (!hasUserEventAtAnchor) {
    events.push({ type: syntheticType, ts: anchorTs, trigger: "auto" });
  }

  // add the first boundary after anchor, if it is before now
  // compute next boundary after anchor
  const next = nextBoundaryAfter(schedule, anchorTs);
  if (next && next > anchorTs && next <= nowTs) {
    events.push({
      type: initial === "eating" ? EVENT.START : EVENT.END,
      ts: next,
      trigger: "auto",
    });
  }

  // optional: if two boundaries have passed since anchor, add the second one
  const maybeSecond = next ? nextBoundaryAfter(schedule, next + 1) : null;
  if (maybeSecond && maybeSecond <= nowTs) {
    events.push({
      type: initial === "eating" ? EVENT.END : EVENT.START,
      ts: maybeSecond,
      trigger: "auto",
    });
  }

  return events.sort((a, b) => a.ts - b.ts);
}

// helper to get the next boundary strictly after a timestamp
export function nextBoundaryAfter(schedule, afterTs) {
  const base = dt.startOfDay(new Date(afterTs));
  let startTs = dt.parse(schedule.start, "HH:mm", base).getTime();
  let endTs = dt.parse(schedule.end, "HH:mm", base).getTime();
  if (endTs <= startTs) endTs = dt.addDays(new Date(endTs), 1).getTime();

  const candidates = [startTs, endTs, startTs + 86400000, endTs + 86400000];
  const next = candidates.filter((ts) => ts > afterTs).sort((a, b) => a - b)[0];
  return next ?? null;
}
