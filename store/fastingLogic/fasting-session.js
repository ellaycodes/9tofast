/** Return the initial state structure the context expects */
export function getInitialState() {
  return {
    schedule: null,
    fastStartTime: null,
  };
}

/** Overwrite the schedule (keep current fastStartTime) */
export function setSchedule(state, schedule) {
  return { ...state, schedule };
}

/** Begin a fast (or restart it) */
export function startFast(state, at = Date.now()) {
  return { ...state, fastStartTime: at };
}

/** Wipe everything except loading flag (handled in the context) */
export function clearAll() {
  return getInitialState();
}

/**
 * Derived metric used by TimerScreen.
 * Returns hours fasted so far today, rounded to one decimal.
 * (Phase 2 will derive this from events[] instead.)
 */
export function hoursFastedToday(state, now = Date.now()) {
  if (!state.fastStartTime) return 0;
  const ms = now - state.fastStartTime;
  return Math.max(0, ms) / 36e5; // 3 600 000 ms per hour
}

/* -----------------------   Phase 2 Notes   ------------------------ */

// TODO: replace fastStartTime with events[]
// export function addEvent(state, type, ts = Date.now()) { … }
// export function getHoursFastedToday(state, schedule, now) { … }
// export function migrateV1toV2(savedObj) { … }

/* ------------------------------------------------------------------ */
