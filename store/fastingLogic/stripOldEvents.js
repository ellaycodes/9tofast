import * as dt from "date-fns";
import { EVENT } from "./events";
import { isFasting } from "./fasting-session";

/**
 * Keep only today's events, adding a START event at midnight if fasting spans midnight.
 *
 * @param {Array<{ts:number,type:string,trigger?:string}>} events
 * @param {Date} [now=new Date()]
 * @returns {Array<{ts:number,type:string,trigger?:string}>}
 */
export function stripOldEvents(events = [], now = new Date()) {
  const startOfToday = dt.startOfDay(now).getTime();
  const prevEvents = events.filter((e) => e.ts < startOfToday);
  let remaining = events.filter((e) => e.ts >= startOfToday);

  if (prevEvents.length && isFasting(prevEvents)) {
    remaining = [
      { type: EVENT.START, ts: startOfToday, trigger: EVENT.TRIGGER },
      ...remaining,
    ];
  }

  return remaining;
}
