import * as dt from "date-fns";
import { EVENT } from "./events";
import { isFasting } from "./fasting-session";
import { logWarn } from "../util/logger";

/**
 * Milliseconds after "now" beyond which future events are discarded.
 * Exposed for reuse in tests.
 */
export const HORIZON_MS = 48 * 3600 * 1000;

/**
 * Remove events beyond {@link HORIZON_MS} of the provided time.
 * Logs dropped events to avoid re-saving them.
 *
 * @param {Array<{ts:number,type:string,trigger?:string}>} events
 * @param {Date} [now=new Date()]
 * @returns {Array<{ts:number,type:string,trigger?:string}>}
 */

export function filterEventHorizon(events = [], now = new Date()) {
  const horizon = now.getTime() + HORIZON_MS;
  const inRange = events.filter((e) => e.ts <= horizon);
  const outOfRange = events.filter((e) => e.ts > horizon);
  if (outOfRange.length) {
    logWarn("[fasting-persistence] dropping future events:", outOfRange);
  }
  return inRange;
}

/**
 * Keep only today's events and those within the horizon, adding a START event
 * at midnight if fasting spans midnight.
 *
 * @param {Array<{ts:number,type:string,trigger?:string}>} events
 * @param {Date} [nowDate=new Date()]
 * @returns {Array<{ts:number,type:string,trigger?:string}>}
 */
export function stripOldEvents(events = [], nowDate = new Date()) {
  const startOfToday = dt.startOfDay(nowDate).getTime();
  const candidates = filterEventHorizon(events, nowDate);
  const prevEvents = candidates.filter((e) => e.ts < startOfToday);
  let remaining = candidates.filter((e) => e.ts >= startOfToday);

  if (prevEvents.length && isFasting(prevEvents)) {
    remaining = [
      { type: EVENT.START, ts: startOfToday, trigger: EVENT.TRIGGER },
      ...remaining,
    ];
  }

  return remaining;
}
