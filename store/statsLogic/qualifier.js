import { differenceInCalendarDays, parseISO } from "date-fns";

export function dayQualifier(today, lastStreakDate) {
  if (!lastStreakDate) return "missed";

  const todayISO = parseISO(today);
  const lastStreakDateISO = parseISO(lastStreakDate);

  const diff = differenceInCalendarDays(todayISO, lastStreakDateISO);

  if (diff === 0) {
    return "same";
  }

  if (diff === 1) {
    return "yesterday";
  }

  if (diff > 1) {
    return "missed";
  }

  return "same";
}

export function fastingQualifier(fastedHours, fastingGoalHours) {
  if (!fastingGoalHours) return false;
  if (fastedHours == null) return false;
  return fastedHours >= fastingGoalHours;
}
