import * as dt from "date-fns";
import { EVENT } from "./events";
import { isFasting } from "./fasting-session";
import { logWarn } from "../../util/logger";

//sets a “time horizon” — 48 hours (2 days) ahead of the current time
export const HORIZON_MS = 48 * 3600 * 1000;

// Take all fasting events. Keep only those that happen now or within 48 hours from now. 
// If there are any events scheduled further in the future, log a warning and ignore them.
export function removeFutureEvents(events = [], currentTime = new Date()) {
  const futureLimit = currentTime.getTime() + HORIZON_MS;
  const validEvents = events.filter(event => event.ts <= futureLimit);
  const futureEvents = events.filter(event => event.ts > futureLimit);
  if (futureEvents.length > 0) {
    logWarn("[fasting-persistence] Ignoring events too far in the future:", futureEvents);
  }
  return validEvents;
}


export function removeOldEventsAndHandleMidnight(events = [], currentTime = new Date()) {
  // Get midnight for the current day
  const startOfToday = dt.startOfDay(currentTime).getTime();

  // First, ignore any events that are unrealistically far in the future
  const recentEvents = removeFutureEvents(events, currentTime);

  // Separate events that happened before today and events from today onward
  const eventsBeforeToday = recentEvents.filter(event => event.ts < startOfToday);
  let eventsFromToday = recentEvents.filter(event => event.ts >= startOfToday);

  // If the user was fasting before midnight and is still fasting,
  // insert a synthetic "start" event at midnight to show the fast continued into today
  const fastingContinuedOvernight = eventsBeforeToday.length > 0 && isFasting(eventsBeforeToday);
  if (fastingContinuedOvernight) {
    const midnightStartEvent = {
      type: EVENT.START,
      ts: startOfToday,
      trigger: EVENT.TRIGGER,
    };
    eventsFromToday = [midnightStartEvent, ...eventsFromToday];
  }

  // Return only today's valid events (plus any midnight continuation)
  return eventsFromToday;
}

