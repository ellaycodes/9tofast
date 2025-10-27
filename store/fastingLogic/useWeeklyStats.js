import { useState, useCallback, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import * as dt from "date-fns";
import { auth } from "../../firebase/app";
import { getDailyStatsRange } from "../../firebase/fasting.db.js";
import { logWarn } from "../../util/logger";

export default function useWeeklyStats() {
  const [weeklyStats, setWeeklyStats] = useState([]);

  const refreshWeeklyStats = useCallback(async (startDate, endDate) => {
    if (!auth.currentUser) {
      setWeeklyStats([]);
      return;
    }
    try {
      const resolvedEnd = endDate || new Date();
      const resolvedStart = startDate || dt.subDays(resolvedEnd, 6);
      const end = dt.format(resolvedEnd, "yyyy-MM-dd");
      const start = dt.format(resolvedStart, "yyyy-MM-dd");
      const stats = await getDailyStatsRange(auth.currentUser.uid, start, end);
      setWeeklyStats(stats);
    } catch (error) {
      logWarn("[weekly-stats] refreshWeeklyStats", error);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        refreshWeeklyStats();
      } else {
        setWeeklyStats([]);
      }
    });

    return unsub;
  }, [refreshWeeklyStats]);

  return { weeklyStats, refreshWeeklyStats };
}
