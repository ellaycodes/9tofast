/**
 * @typedef {'skip-breakfast-16-8' | 'work-lunch-14-10' | 'after-hours-18-6'} PresetId
 *
 * @typedef {'fast' | 'rest'} DayType
 *
 * @typedef {Object} DayConfig
 * @property {string}   start        - HH:mm eating-window open (fasting ends)
 * @property {string}   end          - HH:mm eating-window close (fasting begins)
 * @property {number}   fastingHours
 * @property {DayType}  type         - 'fast' | 'rest'
 * @property {PresetId} [presetId]   - present when config originated from a named preset
 * @property {string}   [label]      - display label (from preset or 'Custom')
 *
 * @typedef {'uniform' | 'perDay'} ScheduleMode
 *
 * @typedef {Object} WeeklySchedule
 * @property {ScheduleMode} mode     - 'uniform' = all days equal; 'perDay' = days vary
 * @property {string}       timeZone - IANA timezone locked at creation time
 * @property {{
 *   monday:    DayConfig,
 *   tuesday:   DayConfig,
 *   wednesday: DayConfig,
 *   thursday:  DayConfig,
 *   friday:    DayConfig,
 *   saturday:  DayConfig,
 *   sunday:    DayConfig,
 * }} days
 */

export const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const LABEL_TO_PRESET_ID = {
  "Skip Breakfast 16:8 (12pm - 8pm)": "skip-breakfast-16-8",
  "Work-Lunch Window 14:10 (9am - 7pm)": "work-lunch-14-10",
  "After-Hours Fast 18:6 (5pm - 11pm)": "after-hours-18-6",
};

/**
 * Returns the day-of-week key ("monday"–"sunday") for a given instant in the
 * specified timezone.
 *
 * @param {Date|number} dateOrTs
 * @param {string} timeZone
 * @returns {string}
 */
export function getDayKey(dateOrTs, timeZone) {
  const date =
    typeof dateOrTs === "number" ? new Date(dateOrTs) : dateOrTs;
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" })
    .format(date)
    .toLowerCase();
}

/**
 * @param {WeeklySchedule} weeklySchedule
 * @param {string} dayKey
 * @returns {DayConfig|null}
 */
export function getDayConfig(weeklySchedule, dayKey) {
  return weeklySchedule?.days?.[dayKey] ?? null;
}

/**
 * Returns the DayConfig for the current day in the schedule's timezone.
 *
 * @param {WeeklySchedule} weeklySchedule
 * @param {string} [timeZoneOverride]
 * @returns {DayConfig|null}
 */
export function getTodayConfig(weeklySchedule, timeZoneOverride) {
  if (!weeklySchedule) return null;
  const tz =
    timeZoneOverride ||
    weeklySchedule.timeZone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;
  return getDayConfig(weeklySchedule, getDayKey(new Date(), tz));
}

/**
 * Detects whether an object is a WeeklySchedule (new shape) rather than a
 * legacy flat schedule.
 *
 * @param {any} obj
 * @returns {boolean}
 */
export function isWeeklySchedule(obj) {
  return (
    obj != null &&
    typeof obj === "object" &&
    "mode" in obj &&
    "days" in obj
  );
}

/**
 * Extracts the backward-compatible flat single-schedule object from a
 * WeeklySchedule.  For 'uniform' mode uses monday (all days equal).
 * For 'perDay' mode uses today's config.
 * Returns null if no fasting config is available.
 *
 * @param {WeeklySchedule} weeklySchedule
 * @returns {Object|null}
 */
export function flatScheduleFromWeekly(weeklySchedule) {
  if (!weeklySchedule) return null;
  const config =
    weeklySchedule.mode === "uniform"
      ? weeklySchedule.days.monday
      : getTodayConfig(weeklySchedule);
  if (!config || config.type === "rest") return null;
  return {
    start: config.start,
    end: config.end,
    fastingHours: config.fastingHours,
    ...(config.label && { label: config.label }),
    ...(config.presetId && { presetId: config.presetId }),
    timeZone: weeklySchedule.timeZone,
  };
}

/**
 * Returns 'uniform' if all 7 days share the same start/end/fastingHours/type,
 * otherwise 'perDay'.
 *
 * @param {WeeklySchedule['days']} days
 * @returns {ScheduleMode}
 */
export function computeMode(days) {
  const configs = DAY_KEYS.map((k) => days[k]).filter(Boolean);
  if (configs.length < 2) return "uniform";
  const ref = configs[0];
  return configs.every(
    (c) =>
      c.start === ref.start &&
      c.end === ref.end &&
      c.fastingHours === ref.fastingHours &&
      c.type === ref.type
  )
    ? "uniform"
    : "perDay";
}

/**
 * Returns a new WeeklySchedule with one day replaced and mode recomputed.
 *
 * @param {WeeklySchedule} weeklySchedule
 * @param {string} dayKey
 * @param {DayConfig} dayConfig
 * @returns {WeeklySchedule}
 */
export function setDayConfig(weeklySchedule, dayKey, dayConfig) {
  const days = { ...weeklySchedule.days, [dayKey]: { ...dayConfig } };
  return { ...weeklySchedule, days, mode: computeMode(days) };
}

/**
 * Returns a new WeeklySchedule with every day set to dayConfig (mode: 'uniform').
 *
 * @param {WeeklySchedule} weeklySchedule
 * @param {DayConfig} dayConfig
 * @returns {WeeklySchedule}
 */
export function applyToAllDays(weeklySchedule, dayConfig) {
  const days = {};
  for (const key of DAY_KEYS) days[key] = { ...dayConfig };
  return { ...weeklySchedule, days, mode: "uniform" };
}

/**
 * Converts a legacy flat schedule to a 7-day uniform WeeklySchedule, setting
 * every day to the same 'fast' config.  Idempotent: if the input is already a
 * WeeklySchedule it is returned as-is.
 *
 * @param {Object} legacy - { start, end, fastingHours, timeZone, label?, presetId? }
 * @returns {WeeklySchedule}
 */
export function buildWeeklyScheduleFromLegacy(legacy) {
  if (isWeeklySchedule(legacy)) return legacy;
  const timeZone =
    legacy.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const presetId =
    legacy.presetId || LABEL_TO_PRESET_ID[legacy.label] || undefined;
  const dayConfig = {
    start: legacy.start,
    end: legacy.end,
    fastingHours: legacy.fastingHours,
    type: "fast",
    ...(presetId && { presetId }),
    ...(legacy.label && { label: legacy.label }),
  };
  const days = {};
  for (const key of DAY_KEYS) {
    days[key] = { ...dayConfig };
  }
  return { mode: "uniform", timeZone, days };
}
