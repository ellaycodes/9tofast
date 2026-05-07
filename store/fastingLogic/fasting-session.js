import {
  formatDayString,
  getScheduleTimeZone,
  startOfDayTs,
} from "../../util/timezone";

export function getInitialState() {
  return {
    schedule: null,
    weeklySchedule: null,
    events: [],
    loading: true,
  };
}

export function setSchedule(state, schedule) {
  return { ...state, schedule };
}

export function clearAll() {
  return getInitialState();
}

// events: array of { type: "start"|"end", ts }
// "start" = start fasting, "end" = stop fasting
export function isFasting(events) {
  if (!events || !events.length) return false;
  return events[events.length - 1].type === "start";
}

export function hoursFastedToday(state, now = Date.now()) {
  const { schedule, events = [] } = state;
  if (!schedule && !events.length) return 0;

  const timeZone = getScheduleTimeZone(schedule);
  const dayStart = startOfDayTs(now, timeZone);
  const sorted = [...events].sort((a, b) => a.ts - b.ts);

  // Determine fasting state at the start of today from events before midnight.
  // This handles overnight fasts without needing synthetic baseline events.
  const beforeMidnight = sorted.filter((e) => e.ts < dayStart);
  let active =
    beforeMidnight.length > 0
      ? beforeMidnight[beforeMidnight.length - 1].type === "start"
      : false;

  let cursor = dayStart;
  let totalMs = 0;

  for (const e of sorted.filter((e) => e.ts >= dayStart && e.ts <= now)) {
    if (active) totalMs += e.ts - cursor;
    cursor = e.ts;
    active = e.type === "start";
  }

  if (active) totalMs += now - cursor;
  return +(totalMs / 36e5).toFixed(5);
}

// Builds the daily stats snapshot for the current day.
// Used by fasting-context to upload today's progress to Firestore.
export function buildCurrentDayStats(state, now = new Date()) {
  const timeZone = getScheduleTimeZone(state.schedule);
  const dayString = formatDayString(now, timeZone);
  const dayStart = startOfDayTs(now, timeZone);
  const hoursToday = hoursFastedToday(state, now.getTime());
  const scheduleHours = state.schedule?.fastingHours ?? undefined;
  const eventsToday = (state.events || []).filter((e) => e.ts >= dayStart);

  return {
    day: dayString,
    hoursFasted: hoursToday,
    scheduleHours,
    events: eventsToday,
    timeZone,
    dayStartUtc: dayStart,
  };
}
