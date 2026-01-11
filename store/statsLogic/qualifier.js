import { addDaysInTimeZone, formatDayString } from "../../util/timezone";

export function dayQualifier(today, lastStreakDate, timeZone) {
  if (!lastStreakDate) return "missed";

  if (today === lastStreakDate) {
    return "same";
  }

  const yesterday = formatDayString(
    addDaysInTimeZone(Date.now(), -1, timeZone),
    timeZone
  );
  if (lastStreakDate === yesterday) {
    return "yesterday";
  }

  return "missed";
}

export function fastingQualifier(fastedHours, fastingGoalHours) {
  if (!fastingGoalHours) return false;
  if (fastedHours == null) return false;
  return fastedHours >= fastingGoalHours;
}
