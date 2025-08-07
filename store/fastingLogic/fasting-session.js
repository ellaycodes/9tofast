import * as ev from "./events";
import { generateBaselineEvents } from "./scheduler";

export function getInitialState() {
  return {
    schedule: null,
    events: [],
    hours: 0,
  };
}

export function setSchedule(state, schedule) {
  return { ...state, schedule };
}

export function clearAll() {
  return getInitialState();
}

// isFasting([{ start: 10 }, { pause: 20 }, { resume: 30 }])
// → true
export function isFasting(events) {
  if (!events.length) return false;
  const last = events[events.length - 1].type;
  return last === ev.EVENT.START;
}

// hoursFastedToday({
//   events: [
//     { type: 'start', ts: 1690444800000 }, // 00:00
//     { type: 'pause', ts: 1690448400000 }, // 01:00
//     { type: 'resume', ts: 1690452000000 }, // 02:00
//     { type: 'end', ts: 1690455600000 }    // 03:00
//   ]
// })
// → 2.0 hours
export function hoursFastedToday(state, now = Date.now()) {
  const { schedule, events: userEvents = [] } = state;

  // If there's no schedule and no events, nothing to calculate
  if (!schedule && !userEvents.length) return 0;

  // Generate default fasting structure for the day
  const baseline = schedule ? generateBaselineEvents(schedule) : [];

  // Merge and sort all events
  const all = [...baseline, ...userEvents].sort((a, b) => a.ts - b.ts);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const midnight = todayStart.getTime();

  let cursor = midnight;
  let active = false;
  let totalMs = 0;

  for (const e of all) {
    if (e.ts < midnight) {
      // Carry forward fasting state from before today
      if (e.type === ev.EVENT.START) active = true;
      if (e.type === ev.EVENT.END) active = false;
      continue;
    }

    if (active) totalMs += e.ts - cursor;
    cursor = e.ts;

    if (e.type === ev.EVENT.START) active = true;
    if (e.type === ev.EVENT.END) active = false;
  }

  return +(totalMs / 36e5).toFixed(5); // ms → hours (1 decimal place)
}
