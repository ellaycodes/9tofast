import { format } from "date-fns";
import { auth } from "../../firebase/app";
import { getDailyStatsDb } from "../../firebase/fasting.db.js";

export async function yesterdayHoursFasted() {
  const oneDay = 24 * 60 * 60 * 1000;
  const yesterday = format(new Date(Date.now() - oneDay), "yyyy-MM-dd");
  const stats = await getDailyStatsDb(auth?.currentUser?.uid, yesterday);

  if (!stats) {
    return 0;
  }

  return stats.hoursFastedToday ?? 0;
}
