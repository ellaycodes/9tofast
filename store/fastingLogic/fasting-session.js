export const EVENT = Object.freeze({
  START: "start", // user begins a fast (or starts early)
  END: "end", // user ends the fast for the day
});

// getInitialState()
// → { schedule: null, events: [] }
export function getInitialState() {
  return {
    schedule: null,
    events: [],
    overrideFast: null
  };
}

// addEvent(
//   { schedule: {…}, events: [] },
//   'start',
//   1753576789098
// )
// → { schedule: {...}, events: [{ type: 'start', ts: 1753576789098 }] }
export function addEvent(state, type, ts = Date.now()) {
  // prevent double-start, double-pause, etc.
  const current = isFasting(state.events);
  
  if (type === EVENT.START && current) {
    return state; // ignore invalid transition
  }

  return { ...state, events: [...state.events, { type, ts }] };
}

// startFast(state, 1753576789098)
// → { schedule: {...}, events: [{ type: 'start', ts: 1753576789098 }] }
export const startFast = (s, t) => addEvent(s, EVENT.START, t);

// endFast({ events: [{ start: 10 }] }, 50)
// → events = [{ start: 10 }, { end: 50 }]
export const endFast = (s, t) => addEvent(s, EVENT.END, t);

// setSchedule(
//   { schedule: null, events: [] },
//   { label: "Custom", start: "2025-07-27T11:00:56.000Z", end: "2025-07-27T17:00:56.000Z" }
// )
// → { schedule: {label: "Custom", start: ..., end: ...}, events: [] }
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
  return last === EVENT.START;
}

// schedule = { start: ISO string, end: ISO string }
// now = optional timestamp (ms)
export function generateBaselineEvents(schedule, now = Date.now()) {
  if (!schedule || !schedule.start || !schedule.end) return [];

  const startTs = new Date(schedule.start).getTime();
  const endTs = new Date(schedule.end).getTime();

  // define today’s 00:00 and now
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const midnight = todayStart.getTime();

  const events = [];

  // Fasting from midnight to schedule.start
  if (startTs > midnight) {
    events.push({ type: "start", ts: midnight });
  }

  events.push({ type: "end", ts: startTs });

  // Eating window happens during this range
  // (we do nothing during this time)

  // Fasting resumes after schedule.end to now
  if (endTs < now) {
    events.push({ type: "start", ts: endTs });
  }

  events.push({ type: "checkpoint", ts: now });
  return events;
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
      if (e.type === EVENT.START) active = true;
      if (e.type === EVENT.END) active = false;
      continue;
    }

    if (active) totalMs += e.ts - cursor;
    cursor = e.ts;

    if (e.type === EVENT.START) active = true;
    if (e.type === EVENT.END) active = false;
  }

  return +(totalMs / 36e5).toFixed(5); // ms → hours (1 decimal place)
}
