import * as ev from "./events";
import { baselineSinceAnchor } from "./scheduler";

export function getInitialState() {
  return {
    schedule: null,
    events: [],
    baselineAnchorTs: null,
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

export function hoursFastedToday(state, now = Date.now()) {
  const { schedule, events: userEvents = [], baselineAnchorTs } = state;
  if (!schedule && !userEvents.length) return 0;

  // build baseline once
  const baseline = schedule
    ? baselineSinceAnchor(schedule, baselineAnchorTs, now, userEvents)
    : [];

  // helper: are we fasting at a given time?
  const activeAt = (atTs) => {
    const allUpTo = [
      ...baseline.filter((e) => e.ts <= atTs),
      ...userEvents.filter((e) => e.ts <= atTs),
    ].sort((a, b) => a.ts - b.ts);

    let active = false;
    for (const e of allUpTo) {
      if (e.type === ev.EVENT.START || e.type === "start") active = true;
      if (e.type === ev.EVENT.END || e.type === "end") active = false;
    }
    return active;
  };

  // midnight anchor for "today"
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const dayStart = midnight.getTime();

  // only today’s events, sorted, and collapse exact dupes
  const all = [...baseline, ...userEvents]
    .filter((e) => e.ts >= dayStart && e.ts <= now)
    .sort((a, b) => a.ts - b.ts)
    .filter(
      (e, i, arr) =>
        i === 0 || !(e.ts === arr[i - 1].ts && e.type === arr[i - 1].type)
    );

  // starting state at midnight
  let active = activeAt(dayStart);
  let cursor = dayStart;
  let totalMs = 0;

  for (const e of all) {
    // accrue up to this event if we are active
    if (active) totalMs += e.ts - cursor;
    cursor = e.ts;

    // flip state on this event
    if (e.type === ev.EVENT.START || e.type === "start") active = true;
    if (e.type === ev.EVENT.END || e.type === "end") active = false;
  }

  // tail after last event, up to now
  if (active) totalMs += now - cursor;

  return +(totalMs / 36e5).toFixed(5);
}
