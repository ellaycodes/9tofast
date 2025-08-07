import { useEffect } from "react";
import { EVENT } from "./events";
import * as dt from "date-fns";

export function generateBaselineEvents({ start, end }, now = Date.now()) {
  if (!start || !end) return [];

  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);

  const toTs = (hhmm) => dt.parse(hhmm, "HH:mm", todayMidnight).getTime();
  const startTs = toTs(start);
  const endTs = toTs(end);
  const xMidnight = endTs <= startTs;

  const events = [
    { type: "start", ts: todayMidnight.getTime(), trigger: "auto" },
    { type: "end", ts: startTs, trigger: "auto" },
  ];

  if (xMidnight ? endTs + 86_400_000 < now : endTs < now) {
    events.push({ type: "start", ts: endTs, trigger: "auto" });
  }

  events.push({ type: "checkpoint", ts: now, trigger: "auto" });
  return events;
}

export default function useBaselineScheduler(schedule, events, dispatch) {
  useEffect(() => {
    if (!schedule) return;

    const id = setInterval(() => {
      const now = Date.now();

      const last = events.at(-1);
      const lastWasManual = last?.trigger === "manual";

      const baseline = generateBaselineEvents(schedule, now)
        .filter(
          (e) =>
            e.ts > (lastWasManual ? last.ts : -Infinity) &&
            e.ts <= now &&
            e.type !== "checkpoint"
        )
        .sort((a, b) => a.ts - b.ts);

      if (!baseline.length) return;

      const seen = new Set(events.map((e) => e.type + e.ts));

      baseline.forEach((b) => {
        if (lastWasManual && last.type === b.type) {
          return;
        }

        const key = b.type + b.ts;

        if (seen.has(key)) return;

        dispatch({
          type: b.type === EVENT.START ? "START_FAST" : "END_FAST",
          payload: b.ts,
          trigger: "auto",
        });
      });
    }, 100);

    return () => clearInterval(id);
  }, [schedule, events, dispatch]);
}
