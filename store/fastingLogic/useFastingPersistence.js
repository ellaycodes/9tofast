import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { getInitialState, hoursFastedToday } from "./fasting-session";
import {
  addDailyStatsDb,
  getFastingSchedule,
  getFastingStateDb,
  setFastingStateDb,
} from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";
import * as date from "date-fns";
import { removeFutureEvents } from "./stripOldEvents.js";
import { logWarn } from "../../util/logger.js";

const STORAGE_KEY = "fastingstate_v2";
export const LAST_UPLOADED_DAY_KEY = "fasting_last_uploaded_day";
const LAST_SAVED_TIMESTAMP_KEY = "fasting_last_ts";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getRemoteUpdatedAtMs(remoteState) {
  if (!remoteState) return 0;
  const lastUpdatedAt = remoteState.lastUpdatedAt;
  if (!lastUpdatedAt) return 0;
  if (typeof lastUpdatedAt.toMillis === "function") {
    return lastUpdatedAt.toMillis();
  }
  if (typeof lastUpdatedAt === "number") {
    return lastUpdatedAt;
  }
  if (typeof lastUpdatedAt.seconds === "number") {
    return lastUpdatedAt.seconds * 1000;
  }
  return 0;
}

function normalizeEventTimestamps(events = []) {
  return events.map((event) => {
    if (event.ts !== undefined) return event;
    if (event.timestamp !== undefined) {
      const { timestamp, ...rest } = event;
      return { ...rest, ts: timestamp };
    }
    return event;
  });
}

/**
 * Get the last time the fasting data was saved.
 * Returns a timestamp or 0 if not available.
 */
async function getLastSavedTime(lastTimestamp) {
  if (lastTimestamp !== undefined) return lastTimestamp;

  const stored = await AsyncStorage.getItem(LAST_SAVED_TIMESTAMP_KEY);
  return stored ? Number(stored) : 0;
}

/**
 * Save a new version of the events list after cleaning and filtering.
 * Writes only when there’s an actual change.
 */
async function updateStoredEvents(
  parsedState,
  originalEvents,
  updatedEvents,
  now,
  hadPreviousEvents,
  saveDailyEvents
) {
  const validEvents = removeFutureEvents(updatedEvents, now);
  const changed =
    hadPreviousEvents || validEvents.length !== originalEvents.length;

  if (changed) {
    await saveDailyEvents(validEvents);
  }

  parsedState.events = validEvents;
}

// helper that computes the current day stats from the current state
export function buildCurrentDayStats(state, now = new Date()) {
  const dayString = date.format(now, "yyyy-MM-dd");
  const hoursToday = hoursFastedToday(state, now.getTime());
  const scheduleHours = state.schedule?.fastingHours ?? undefined;

  // You can choose if you want to pass today’s events or not
  const eventsToday = (state.events || []).filter(
    (event) => event.ts >= date.startOfDay(now).getTime()
  );

  return {
    day: dayString,
    hoursFasted: hoursToday,
    scheduleHours,
    events: eventsToday,
  };
}

/**
 * Main hook: manages loading, saving, cleaning, and syncing fasting data.
 */

// persist: save the current fasting state locally.
// addFastingEvent: Adds a single new fasting event — like when a user starts or stops a fast.
// addDailyStats: Uploads a day’s fasting summary to Firebase.
// flushDailyEvents: Updates the local event list (AsyncStorage) with a cleaned, updated version.
// processParsed: Whenever you load the stored fasting state, this ensures it’s valid and up to date.
// load: app always starts with something valid — either your last session or a clean default
export default function useFastingPersistence() {
  /**
   * Save the current fasting state locally.
   * Cleans up events first and updates last saved timestamp.
   */
  const saveLocalState = useCallback(async (state) => {
    try {
      const stateToSave = { ...state };
      delete stateToSave.hours;

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      await AsyncStorage.setItem(
        LAST_SAVED_TIMESTAMP_KEY,
        Date.now().toString()
      );
    } catch (error) {
      logWarn("[fasting-persistence] saveLocalState() failed:", error);
    }
  }, []);

  /**
   * Add a new fasting event (e.g. start or stop).
   * Updates local storage immediately.
   */
  const addFastingEvent = useCallback(async (timestamp, type, trigger) => {
    try {
      const rawState = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedState = rawState ? JSON.parse(rawState) : getInitialState();

      const updatedEvents = [
        ...(parsedState.events || []),
        { ts: timestamp, type, trigger },
      ];
      parsedState.events = updatedEvents;

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedState));
      await AsyncStorage.setItem(
        LAST_SAVED_TIMESTAMP_KEY,
        Date.now().toString()
      );
    } catch (error) {
      logWarn("[fasting-persistence] addFastingEvent() failed:", error);
      throw error;
    }
  }, []);

  /**
   * Upload one day’s fasting summary to Firebase.
   * Stores that day locally to avoid double-uploading.
   */
  const uploadDailyStats = useCallback(
    async (day, hours, scheduleHours, events = []) => {
      if (!auth.currentUser) return;
      try {
        await addDailyStatsDb(
          auth.currentUser.uid,
          day,
          hours,
          scheduleHours,
          events
        );
        await AsyncStorage.setItem(LAST_UPLOADED_DAY_KEY, day);
      } catch (error) {
        logWarn("[fasting-persistence] uploadDailyStats() failed:", error);
        throw error;
      }
    },
    []
  );

  /**
   * Replace stored events with a cleaned-up version.
   */
  const saveDailyEvents = useCallback(async (events) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      parsed.events = events;

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      await AsyncStorage.setItem(
        LAST_SAVED_TIMESTAMP_KEY,
        Date.now().toString()
      );
    } catch (error) {
      logWarn("[fasting-persistence] saveDailyEvents() failed:", error);
    }
  }, []);

  /**
   * Clean up and process the current fasting state.
   * - Removes stale data if it’s older than 24 hours.
   * - Uploads yesterday’s data if needed.
   * - Cleans up events for today.
   */
  const processLoadedState = useCallback(
    async (parsedState, lastSavedTimestamp) => {
      delete parsedState.hours;

      const lastSavedTime = await getLastSavedTime(lastSavedTimestamp);
      const now = new Date();
      const nowTs = now.getTime();

      // Reset everything if data is stale (more than a day old)
      if (lastSavedTime && nowTs - lastSavedTime > ONE_DAY_MS) {
        logWarn(
          "[fasting-persistence] Stale local data detected; preserving events."
        );
      }

      const normalizedEvents = normalizeEventTimestamps(
        parsedState.events || []
      );

      const validEvents = removeFutureEvents(normalizedEvents, now);

      await updateStoredEvents(
        parsedState,
        normalizedEvents,
        validEvents,
        now,
        normalizedEvents.length,
        saveDailyEvents
      );

      return parsedState;
    },
    [
      // uploadDailyStats,
      saveDailyEvents,
    ]
  );

  /**
   * Load the fasting state when the app starts or user logs in.
   * - Reconciles local AsyncStorage data with Firebase using lastUpdatedAt.
   * - Falls back when either side is missing.
   * - Always returns a clean, ready-to-use state.
   */
  const loadFastingState = useCallback(async () => {
    try {
      const localData = await AsyncStorage.getItem(STORAGE_KEY);
      const localState = localData ? JSON.parse(localData) : null;
      const localLastSavedTime = await getLastSavedTime();

      if (auth.currentUser) {
        const remoteState = await getFastingStateDb(auth.currentUser.uid);
        if (remoteState) {
          const remoteUpdatedAtMs = getRemoteUpdatedAtMs(remoteState);
          const { lastUpdatedAt, lastTs, ...cleanState } = remoteState;
          const remoteTimestamp = remoteUpdatedAtMs || lastTs || 0;
          const localIsNewer =
            localState && localLastSavedTime >= remoteTimestamp;

          if (!localState || !localIsNewer) {
            const normalizedState = {
              ...cleanState,
              lastUpdatedAt: remoteUpdatedAtMs || undefined,
            };
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(normalizedState)
            );
            if (remoteTimestamp) {
              await AsyncStorage.setItem(
                LAST_SAVED_TIMESTAMP_KEY,
                String(remoteTimestamp)
              );
            }

            return await processLoadedState(normalizedState, remoteTimestamp);
          }

          await setFastingStateDb(auth.currentUser.uid, localState);
          return await processLoadedState(localState, localLastSavedTime);
        }

        if (localState) {
          return await processLoadedState(localState, localLastSavedTime);
        }
      }

      if (auth.currentUser) {
        const userSchedule = await getFastingSchedule(auth.currentUser.uid);
        if (userSchedule) {
          return { ...getInitialState(), schedule: userSchedule };
        }
      }

      // Fall back to a brand new blank state
      return getInitialState();
    } catch (error) {
      logWarn("[fasting-persistence] loadFastingState() failed:", error);
      return getInitialState();
    }
  }, [processLoadedState]);

  return {
    load: loadFastingState,
    persist: saveLocalState,
    addFastingEvent,
    addDailyStats: uploadDailyStats,
    flushDailyEvents: saveDailyEvents,
  };
}
