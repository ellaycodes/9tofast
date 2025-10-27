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
  getFastingSchedule,
  getFastingStateDb,
} from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";
import * as dt from "date-fns";
import { stripOldEvents, filterEventHorizon } from "./stripOldEvents";
import { logWarn } from "../../util/logger.js";

const V2KEY = "fastingstate_v2";
const LAST_DAY_KEY = "fasting_last_uploaded_day";
const LAST_TS_KEY = "fasting_last_ts";
const DAY_MS = 24 * 60 * 60 * 1000;

async function getLastTimestamp(lastTs) {
  if (lastTs !== undefined) return lastTs;
  const lastTsRaw = await AsyncStorage.getItem(LAST_TS_KEY);
  return lastTsRaw ? Number(lastTsRaw) : 0;
}

async function uploadPreviousDay(parsed, startOfToday, addDailyStats) {
  const origEvents = parsed.events || [];
  const prevEvents = origEvents.filter((e) => e.ts < startOfToday);
  const prevDayStr = dt.format(startOfToday - 1, "yyyy-MM-dd");
  const lastUploaded = await AsyncStorage.getItem(LAST_DAY_KEY);
  if (lastUploaded !== prevDayStr) {
    const hoursPrev = hoursFastedToday(parsed, startOfToday - 1);
    const scheduleHours =
      parsed.schedule && parsed.schedule.fastingHours != null
        ? parsed.schedule.fastingHours
        : undefined;
    await addDailyStats(prevDayStr, hoursPrev, scheduleHours, prevEvents);
  }
  return { origEvents, prevEvents };
}

function rebuildEvents(origEvents, prevEvents, startOfToday) {
  let remaining = origEvents;
  if (prevEvents.length) {
    remaining = origEvents.filter((e) => e.ts >= startOfToday);
    if (isFasting(prevEvents)) {
      remaining = [
        { type: EVENT.START, ts: startOfToday, trigger: EVENT.TRIGGER },
        ...remaining,
      ];
    }
  }
  return remaining;
}

async function commitEvents(
  parsed,
  origEvents,
  remaining,
  now,
  prevLen,
  flushDailyEvents
) {
  const filtered = filterEventHorizon(remaining, now);
  if (prevLen || filtered.length !== origEvents.length) {
    await flushDailyEvents(filtered);
  }
  parsed.events = filtered;
}

export default function useFastingPersistence() {
  const persist = useCallback(async (state) => {
    try {
      const events = state.events || [];
      const todayEvents = stripOldEvents(events);
      const filtered = filterEventHorizon(todayEvents);
      const persistable = { ...state };
      delete persistable.hours;
      delete persistable.events;
      await AsyncStorage.setItem(
        V2KEY,
        JSON.stringify({ ...persistable, events: filtered })
      );
      await AsyncStorage.setItem(LAST_TS_KEY, Date.now().toString());
    } catch (error) {
      logWarn("[fasting-persistence] persist() failed:", error);
    }
  }, []);

  const addFastingEvent = useCallback(async (ts, type, trigger) => {
    try {
      const raw = await AsyncStorage.getItem(V2KEY);
      const parsed = raw ? JSON.parse(raw) : getInitialState();
      const events = parsed.events || [];
      events.push({ ts, type, trigger });
      parsed.events = events;
      await AsyncStorage.setItem(V2KEY, JSON.stringify(parsed));
      await AsyncStorage.setItem(LAST_TS_KEY, Date.now().toString());
    } catch (error) {
      logWarn("[fasting-persistence] addFastingEvent() failed:", error);
      throw error;
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
      } catch (error) {
        logWarn("[fasting-persistence] addDailyStats() failed:", error);
        throw error;
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
      await AsyncStorage.setItem(LAST_TS_KEY, Date.now().toString());
    } catch (error) {
      logWarn("[fasting-persistence] flushDailyEvents() failed:", error);
    }
  }, []);

  const processParsed = useCallback(
    async (parsed, lastTs) => {
      delete parsed.hours;

      const lastTsVal = await getLastTimestamp(lastTs);
      const nowTs = Date.now();
      if (lastTsVal && nowTs - lastTsVal > DAY_MS) {
        parsed.events = [];
        parsed.baselineAnchorTs = null;
        return parsed;
      }

      const now = new Date(nowTs);
      const startOfToday = dt.startOfDay(now).getTime();

      const { origEvents, prevEvents } = await uploadPreviousDay(
        parsed,
        startOfToday,
        addDailyStats
      );
      const remaining = rebuildEvents(origEvents, prevEvents, startOfToday);
      await commitEvents(
        parsed,
        origEvents,
        remaining,
        now,
        prevEvents.length,
        flushDailyEvents
      );
      return parsed;
    },
    [addDailyStats, flushDailyEvents]
  );

  const load = useCallback(async () => {
    try {
      const rawV2 = await AsyncStorage.getItem(V2KEY);
      if (rawV2) {
        const parsed = JSON.parse(rawV2);
        return await processParsed(parsed);
      }

      if (auth.currentUser) {
        const saved = await getFastingStateDb(auth.currentUser.uid);
        if (saved) {
          const { lastTs, ...state } = saved;
          await AsyncStorage.setItem(V2KEY, JSON.stringify(state));
          if (lastTs) {
            await AsyncStorage.setItem(LAST_TS_KEY, String(lastTs));
          }
          return await processParsed(state, lastTs);
        }

        const schedule = await getFastingSchedule(auth.currentUser.uid);
        if (schedule) {
          return { ...getInitialState(), schedule };
        }
      }

      return getInitialState();
    } catch (error) {
      logWarn("[fasting-persistence] load() failed:", error);
      return getInitialState();
    }
  }, [processParsed]);

  return { load, persist, addFastingEvent, addDailyStats, flushDailyEvents };
}
