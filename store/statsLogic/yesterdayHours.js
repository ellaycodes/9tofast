import { auth } from "../../firebase/app";
import { getDailyStatsDb } from "../../firebase/fasting.db.js";
import { addDaysInTimeZone, formatDayString } from "../../util/timezone";

export async function yesterdayHoursFasted(timeZone) {
  const uid = auth?.currentUser?.uid;
  if (!uid) return 0;

  const yesterday = formatDayString(
    addDaysInTimeZone(Date.now(), -1, timeZone),
    timeZone
  );
  const stats = await getDailyStatsDb(uid, yesterday);

  if (!stats) {
    return 0;
  }

  return stats.hoursFastedToday ?? 0;
}
