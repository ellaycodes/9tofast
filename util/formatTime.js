import {
  addDaysInTimeZone,
  getScheduleTimeZone,
  startOfDayTs,
  timeStringToZonedTs,
} from "./timezone";

/**
 * Pads a number with leading zeros to two digits.
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
 */
export function formatTime(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);

  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });
}

/**
 * Builds Date objects for today's start & end window.
 *
 * Examples:
 *   const schedule = { start: '08:00', end: '17:00' };
 *   // start: "08:00"
 *   // end:   "17:00"
 */
export const todayWindow = (schedule) => {
  const now = new Date();
  const timeZone = getScheduleTimeZone(schedule);
  const base = new Date(startOfDayTs(now, timeZone));
  const startTs = timeStringToZonedTs(schedule.start, base, timeZone);
  let endTs = timeStringToZonedTs(schedule.end, base, timeZone);

  if (endTs <= startTs) {
    endTs = timeStringToZonedTs(
      schedule.end,
      addDaysInTimeZone(base, 1, timeZone),
      timeZone
    );
  }
  return { start: new Date(startTs), end: new Date(endTs) };
};

/**
 * Calculates countdown info for the fasting timer based on a schedule.
 */
export function calcReadout(schedule, now = new Date()) {
  if (!schedule) return;

  const timeZone = getScheduleTimeZone(schedule);
  const nowTs = now.getTime();
  const base = new Date(startOfDayTs(nowTs, timeZone));
  let startTs = timeStringToZonedTs(schedule.start, base, timeZone);
  let endTs = timeStringToZonedTs(schedule.end, base, timeZone);

  if (endTs <= startTs) {
    const nextDayBase = addDaysInTimeZone(base, 1, timeZone);
    endTs = timeStringToZonedTs(schedule.end, nextDayBase, timeZone);
    if (nowTs < endTs) {
      const prevDayBase = addDaysInTimeZone(base, -1, timeZone);
      startTs = timeStringToZonedTs(schedule.start, prevDayBase, timeZone);
    }
  }

  let target, label, fast;

  if (nowTs < startTs) {
    target = startTs;
    label = "Eating window opens in";
    fast = true;
  } else if (nowTs >= startTs && nowTs < endTs) {
    target = endTs;
    label = "Fasting resumes in";
    fast = false;
  } else {
    target = timeStringToZonedTs(
      schedule.start,
      addDaysInTimeZone(base, 1, timeZone),
      timeZone
    );
    label = "Eating window opens in";
    fast = true;
  }
  const diffMs = Math.max(0, target - nowTs);
  return { label, diffMs, units: splitMs(diffMs), fast };
}

/**
 * Convert an ISO-8601 UTC timestamp into a 12-hour UK time label.
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

export function decimalHoursToHms(decimalHours) {
  const totalSeconds = Math.round(decimalHours * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
}

export function timeStringToDate(timeString, base = new Date()) {
  const [h, m] = timeString.split(":").map(Number);
  base.setHours(h, m, 0, 0);
  return base;
}
