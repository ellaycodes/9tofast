import { useState, useCallback, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import * as dt from "date-fns";
import { auth } from "../../firebase/app";
import { getDailyStatsRange } from "../../firebase/fasting.db.js";

export default function useWeeklyStats() {
  const [weeklyStats, setWeeklyStats] = useState([]);

  const refreshWeeklyStats = useCallback(async (startDate, endDate) => {
    if (!auth.currentUser) {
      setWeeklyStats([]);
      return;
    }
    try {
      const end = dt.format(endDate ?? new Date(), "yyyy-MM-dd");
      const start = dt.format(
        startDate ?? dt.subDays(endDate ?? new Date(), 6),
        "yyyy-MM-dd"
      );
      const stats = await getDailyStatsRange(auth.currentUser.uid, start, end);
      setWeeklyStats(stats);
    } catch (error) {
      console.warn("[weekly-stats] refreshWeeklyStats", error);
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
