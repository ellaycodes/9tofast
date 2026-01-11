import * as dt from "date-fns";

const DEFAULT_TIME_ZONE = "UTC";

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function getResolvedTimeZone() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone || DEFAULT_TIME_ZONE;
  } catch (error) {
    return DEFAULT_TIME_ZONE;
  }
}

export function getScheduleTimeZone(schedule) {
  return schedule?.timeZone || getResolvedTimeZone();
}

function getDateTimeParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getTimeZoneOffsetMs(date, timeZone) {
  const parts = getDateTimeParts(date, timeZone);
  const utcFromParts = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return utcFromParts - date.getTime();
}

export function zonedTimeToUtc(
  year,
  month,
  day,
  hour,
  minute,
  second,
  timeZone
) {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offsetMs = getTimeZoneOffsetMs(utcDate, timeZone);
  return new Date(utcDate.getTime() - offsetMs);
}

export function startOfDayTs(dateOrTs, timeZone) {
  const date = dateOrTs instanceof Date ? dateOrTs : new Date(dateOrTs);
  const parts = getDateTimeParts(date, timeZone);
  return zonedTimeToUtc(
    parts.year,
    parts.month,
    parts.day,
    0,
    0,
    0,
    timeZone
  ).getTime();
}

export function addDaysInTimeZone(dateOrTs, days, timeZone) {
  const date = dateOrTs instanceof Date ? dateOrTs : new Date(dateOrTs);
  const parts = getDateTimeParts(date, timeZone);
  const utcBase = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const shifted = dt.addDays(utcBase, days);
  return zonedTimeToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    0,
    0,
    0,
    timeZone
  );
}

export function formatDayString(dateOrTs, timeZone) {
  const date = dateOrTs instanceof Date ? dateOrTs : new Date(dateOrTs);
  const parts = getDateTimeParts(date, timeZone);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function timeStringToZonedTs(timeString, baseDate, timeZone) {
  const [hour, minute] = timeString.split(":").map(Number);
  const parts = getDateTimeParts(baseDate, timeZone);
  return zonedTimeToUtc(
    parts.year,
    parts.month,
    parts.day,
    hour,
    minute,
    0,
    timeZone
  ).getTime();
}