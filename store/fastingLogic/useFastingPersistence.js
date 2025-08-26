import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { getInitialState } from "./fasting-session";
import { addDailyStatsDb, addFastingEventDb } from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";
import * as dt from "date-fns";

const V2KEY = "fastingstate_v2";

export default function useFastingPersistence() {
  const load = useCallback(async () => {
    try {
      const rawV2 = await AsyncStorage.getItem(V2KEY);

      if (rawV2) {
        const parsed = JSON.parse(rawV2);
        delete parsed.hours;
        return parsed;
      }

      return getInitialState();
    } catch (err) {
      console.warn("[fasting-persistence] load() failed:", err);
      return getInitialState();
    }
  }, []);

  const persist = useCallback(async (state) => {
    try {
      const { hours, ...persistable } = state;
      await AsyncStorage.setItem(V2KEY, JSON.stringify(persistable));
    } catch (err) {
      console.warn("[fasting-persistence] persist() failed:", err);
    }
  }, []);

  const addFastingEvent = useCallback((ts, type, trigger) => {
    if (!auth.currentUser) return;
    addFastingEventDb(
      auth.currentUser.uid,
      ts,
      type,
      dt.format(new Date(ts), "yyyy-MM-dd"),
      trigger
    );
  }, []);

  const addDailyStats = useCallback((day, hoursFastedToday, fastingHours) => {
    if (!auth.currentUser) return;
    addDailyStatsDb(auth.currentUser.uid, day, hoursFastedToday, fastingHours);
  }, []);

  return { load, persist, addFastingEvent, addDailyStats };
}
