import { useState, useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import * as dt from "date-fns";
import { auth } from "../../firebase/app";
import { getDailyStatsRange } from "../../firebase/fasting.db.js";
import { logWarn } from "../../util/logger";
import { subscribeWeeklyStatsRefresh } from "./weeklyStatsEvents";
import { useFasting } from "./fasting-context";
import { formatDayString, getScheduleTimeZone } from "../../util/timezone";

export default function useWeeklyStats() {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const { schedule } = useFasting();
  const timeZone = getScheduleTimeZone(schedule);
  const lastFetchRangeRef = useRef(null);

  const refreshWeeklyStats = useCallback(async (startDate, endDate) => {
    if (!auth.currentUser) {
      setWeeklyStats([]);
      return;
    }
    try {
      const resolvedEnd = endDate || new Date();
      const resolvedStart = startDate || dt.subDays(resolvedEnd, 6);
      lastFetchRangeRef.current = { startDate: resolvedStart, endDate: resolvedEnd };
      const end = formatDayString(resolvedEnd, timeZone);
      const start = formatDayString(resolvedStart, timeZone);
      const stats = await getDailyStatsRange(auth.currentUser.uid, start, end);
      setWeeklyStats(stats);
    } catch (error) {
      logWarn("[weekly-stats] refreshWeeklyStats", error);
    }
  }, [timeZone]);

  useEffect(() => {
    const unsubscribeFromRefresh = subscribeWeeklyStatsRefresh(
      ({ startDate, endDate } = {}) => {
        const range = lastFetchRangeRef.current;
        refreshWeeklyStats(startDate ?? range?.startDate, endDate ?? range?.endDate);
      }
    );

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        refreshWeeklyStats();
      } else {
        setWeeklyStats([]);
      }
    });

    return () => {
      unsub();
      unsubscribeFromRefresh();
    };
  }, [refreshWeeklyStats]);

  useEffect(() => {
    const handleAppStateChange = (nextState) => {
      if (nextState === "active") {
        refreshWeeklyStats();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      } else {
        AppState.removeEventListener("change", handleAppStateChange);
      }
    };
  }, [refreshWeeklyStats]);

  return { weeklyStats, refreshWeeklyStats };
}
