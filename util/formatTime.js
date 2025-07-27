/**
 * Pads a number with leading zeros to two digits.
 *
 * Examples:
 *   pad2(5);   // returns "05"
 *   pad2(12);  // returns "12"
 */
export const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Splits a duration in milliseconds into its constituent time components.
 *
 * Examples:
 *   splitMs(3661005);
 *   // returns { hours: 1, minutes: 1, seconds: 1, milliseconds: 5 }
 *
 */
export const splitMs = (ms) => ({
  hours: Math.floor(ms / 3_600_000),
  minutes: Math.floor((ms % 3_600_000) / 60_000),
  seconds: Math.floor((ms % 60_000) / 1_000),
  milliseconds: ms % 1_000,
});

/**
 * Converts milliseconds into an "hh:mm:ss" formatted string, zero-padded.
 *
 * Examples:
 *   msToHms(3661005);
 *   // returns "01:01:01"
 */
export const msToHms = (ms) => {
  const { hours, minutes, seconds } = splitMs(ms);
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
};

/**
 * Formats a Date object into a 24‑hour UK clock string "HH:mm", zero-padded.
 *
 * Examples:
 *
 *   formatTime(new Date('2025-07-26T09:05:00Z'));
 *   // returns "10:05" if your local timezone is BST (UTC+1)
 *
 *   formatTime(new Date('2025-07-26T09:05:00'));
 *   // returns "09:05" if the Date is already in your local timezone
 */
export function formatTime(date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
  });
}

/**
 * Builds Date objects for today's start & end window.
 *
 * Examples:
 *   const schedule = { start: '08:00', end: '17:00' };
 *   const { start, end } = todayWindow(schedule);
 *
 *   // start: "08:00"
 *   // end:   "17:00"
 *
 *   const schedule2 = { start: '23:00', end: '02:00' };
 *   const { start: s2, end: e2 } = todayWindow(schedule2);
 *
 *   // s2: Date at today 23:00
 *   // e2: Date at tomorrow 02:00 (spans midnight)
 *
 */
export const todayWindow = (schedule) => {
  const now = new Date();

  const start = new Date(schedule.start);
  const end = new Date(schedule.end);

  start.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
  end.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

  if (end <= start) end.setDate(end.getDate() + 1); // spans midnight
  return { start, end };
};

/**
 * Calculates countdown info for the fasting timer based on a schedule.
 *
 * Examples:
 *   const schedule = { start: '08:00', end: '17:00' };
 *   // before window opens (fasting)
 *   calcReadout(schedule, new Date('2025-07-26T06:00:00'));
 *   // returns {
 *   //   label: 'Eating window opens in',
 *   //   diffMs: 7200000,
 *   //   units: { hours: 2, minutes: 0, seconds: 0, milliseconds: 0 },
 *   //   fast: true
 *   // }
 *
 *   // during eating window
 *   calcReadout(schedule, new Date('2025-07-26T12:00:00'));
 *   // returns {
 *   //   label: 'Fasting resumes in',
 *   //   diffMs: 18000000,
 *   //   units: { hours: 5, minutes: 0, seconds: 0, milliseconds: 0 },
 *   //   fast: false
 *   // }
 *
 *   // after eating window (resumes fasting next day)
 *   calcReadout(schedule, new Date('2025-07-26T18:00:00'));
 *   // returns {
 *   //   label: 'Eating window opens in',
 *   //   diffMs: 50400000, // 14 hours until next start at 08:00
 *   //   units: { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 },
 *   //   fast: false
 *   // }
 *
 * @pure
 * @param {{ start: string, end: string }} schedule - The eating schedule with start/end times.
 * @param {Date} [now=new Date()] - Optional current time for testing.
 * @returns {{
 *   label: string,           // descriptive label for the countdown
 *   diffMs: number,          // milliseconds until target
 *   units: {
 *     hours: number,
 *     minutes: number,
 *     seconds: number,
 *     milliseconds: number
 *   },
 *   fast: boolean            // true if next phase is fasting
 * }} Countdown details including label, time difference, split units, and fasting flag.
 */
export function calcReadout(schedule, now = new Date()) {
  if (!schedule) return;

  const { start, end } = todayWindow(schedule);

  let target;
  let label;
  let fast;

  if (now < start) {
    target = start;
    label = "Eating window opens in";
    fast = true;
  } else if (now >= start && now < end) {
    target = end;
    label = "Fasting resumes in";
    fast = false;
  } else {
    target = new Date(start);
    target.setDate(target.getDate() + 1);
    label = "Eating window opens in";
    fast = false;
  }

  const diffMs = Math.max(0, target.getTime() - now.getTime());
  return { label, diffMs, units: splitMs(diffMs), fast };
}

/**
 * Convert an ISO-8601 UTC timestamp into a 12-hour UK time label.
 *
 * This is a pure function: given the same `isoUtc` input, it will always return the same output.
 *
 * @param {string} isoUtc – an ISO-8601 string in UTC, e.g. "2025-07-26T20:00:00Z"
 * @returns {string} – the local UK time in “h am/pm” form, all lowercase, e.g. "9 pm"
 *
 * @example
 * // late evening in BST (UTC+1)
 * utcToUkLabel("2025-07-26T20:00:00Z")  // → "9 pm"
 *
 * @example
 * // early morning GMT (UTC+0)
 * utcToUkLabel("2025-12-01T05:30:00Z")  // → "5 am"
 */
export function utcToUkLabel(isoUtc) {
  return new Date(isoUtc)
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      hour12: true,
      timeZone: "Europe/London",
    })
    .toLowerCase();
}

/**
 *
 *  numberToHour(12)
 *
 *  returns "12:00 pm"
 */
export function numberToHour(num) {
  const d = new Date();
  d.setHours(num, 0, 0, 0);

  return formatTime(d);
}
