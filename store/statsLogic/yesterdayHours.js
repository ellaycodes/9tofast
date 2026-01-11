import { auth } from "../../firebase/app";
import { getDailyStatsDb } from "../../firebase/fasting.db.js";
import { addDaysInTimeZone, formatDayString } from "../../util/timezone";

export async function yesterdayHoursFasted(timeZone) {
  const yesterday = formatDayString(
    addDaysInTimeZone(Date.now(), -1, timeZone),
    timeZone
  );
  const stats = await getDailyStatsDb(auth?.currentUser?.uid, yesterday);

  if (!stats) {
    return 0;
  }

  return stats.hoursFastedToday ?? 0;
}
