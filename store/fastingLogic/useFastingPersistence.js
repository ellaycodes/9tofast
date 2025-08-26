import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import {
  getInitialState,
  hoursFastedToday,
  isFasting,
} from "./fasting-session";
import { EVENT } from "./events";
import {
  addDailyStatsDb,
  addFastingEventDb,
  getFastingSchedule,
} from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";
import * as dt from "date-fns";

const V2KEY = "fastingstate_v2";
const LAST_DAY_KEY = "fasting_last_uploaded_day";

export default function useFastingPersistence() {
  const persist = useCallback(async (state) => {
    try {
      const { hours, ...persistable } = state;
      await AsyncStorage.setItem(V2KEY, JSON.stringify(persistable));
    } catch (err) {
      console.warn("[fasting-persistence] persist() failed:", err);
    }
  }, []);

  const addFastingEvent = useCallback(async (ts, type, trigger) => {
    if (!auth.currentUser) return;
    try {
      return await addFastingEventDb(
        auth.currentUser.uid,
        ts,
        type,
        dt.format(new Date(ts), "yyyy-MM-dd"),
        trigger
      );
    } catch (err) {
      console.warn("[fasting-persistence] addFastingEvent() failed:", err);
      throw err;
    }
  }, []);

  const addDailyStats = useCallback(
    async (day, hoursFastedTodayVal, fastingHours, events = []) => {
      if (!auth.currentUser) return;
      try {
        await addDailyStatsDb(
          auth.currentUser.uid,
          day,
          hoursFastedTodayVal,
          fastingHours,
          events
        );
        await AsyncStorage.setItem(LAST_DAY_KEY, day);
      } catch (err) {
        console.warn("[fasting-persistence] addDailyStats() failed:", err);
        throw err;
      }
    },
    []
  );

  const flushDailyEvents = useCallback(async (events) => {
    try {
      const raw = await AsyncStorage.getItem(V2KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      parsed.events = events;
      await AsyncStorage.setItem(V2KEY, JSON.stringify(parsed));
    } catch (err) {
      console.warn("[fasting-persistence] flushDailyEvents() failed:", err);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const rawV2 = await AsyncStorage.getItem(V2KEY);

      if (rawV2) {
        const parsed = JSON.parse(rawV2);
        delete parsed.hours;

        const now = new Date();
        const startOfToday = dt.startOfDay(now).getTime();
        const prevEvents = (parsed.events || []).filter(
          (e) => e.ts < startOfToday
        );

        if (prevEvents.length) {
          const prevDayStr = dt.format(startOfToday - 1, "yyyy-MM-dd");
          const lastUploaded = await AsyncStorage.getItem(LAST_DAY_KEY);

          if (lastUploaded !== prevDayStr) {
            const hoursPrev = hoursFastedToday(parsed, startOfToday - 1);
            await addDailyStats(
              prevDayStr,
              hoursPrev,
              parsed.schedule?.fastingHours,
              prevEvents
            );
          }

          let remaining = parsed.events.filter((e) => e.ts >= startOfToday);
          if (isFasting(prevEvents)) {
            remaining = [
              {
                type: EVENT.START,
                ts: startOfToday,
                trigger: EVENT.TRIGGER,
              },
              ...remaining,
            ];
          }

          await flushDailyEvents(remaining);
          parsed.events = remaining;
        }

        return parsed;
      }

      if (auth.currentUser) {
        const schedule = await getFastingSchedule(auth.currentUser.uid);
        if (schedule) {
          return { ...getInitialState(), schedule };
        }
      }

      return getInitialState();
    } catch (err) {
      console.warn("[fasting-persistence] load() failed:", err);
      return getInitialState();
    }
  }, [addDailyStats, flushDailyEvents]);

  return { load, persist, addFastingEvent, addDailyStats, flushDailyEvents };
}
