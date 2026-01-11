import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import {
  getInitialState,
  hoursFastedToday,
  isFasting,
} from "./fasting-session";
import {
  addDailyStatsDb,
  getFastingSchedule,
  getFastingStateDb,
  setFastingScheduleDb,
  setFastingStateDb,
} from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";
import * as date from "date-fns";
import { removeFutureEvents } from "./stripOldEvents.js";
import { logWarn } from "../../util/logger.js";
import { onAuthStateChanged } from "firebase/auth";
import { EVENT } from "./events";
import {
  formatDayString,
  getResolvedTimeZone,
  getScheduleTimeZone,
  startOfDayTs,
} from "../../util/timezone";

const STORAGE_KEY = "fastingstate_v2";
const LAST_UPLOADED_DAY_KEY = "fasting_last_uploaded_day";
const LAST_SAVED_TIMESTAMP_KEY = "fasting_last_ts";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const EVENT_HORIZON_DAYS = 7;

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

function trimEventsToHorizon(events = [], now = new Date(), timeZone) {
  const horizonStart = startOfDayTs(
    date.subDays(now, EVENT_HORIZON_DAYS),
    timeZone
  );

  const eventsBeforeHorizon = events.filter((event) => event.ts < horizonStart);
  const eventsWithinHorizon = events.filter(
    (event) => event.ts >= horizonStart
  );

  if (!eventsBeforeHorizon.length) {
    return eventsWithinHorizon;
  }

  if (!isFasting(eventsBeforeHorizon)) {
    return eventsWithinHorizon;
  }

  const hasHorizonStart = eventsWithinHorizon.some(
    (event) => event.ts === horizonStart && event.type === EVENT.START
  );

  if (hasHorizonStart) {
    return eventsWithinHorizon;
  }

  return [
    { type: EVENT.START, ts: horizonStart, trigger: EVENT.TRIGGER },
    ...eventsWithinHorizon,
  ];
}

/**
 * Get the last time the fasting data was saved.
 * Returns a timestamp or 0 if not available.
 */
function getScopedStorageKey(baseKey, uid) {
  const scope = uid || "anonymous";
  return `${baseKey}:${scope}`;
}

export function getStateStorageKey(uid) {
  return getScopedStorageKey(STORAGE_KEY, uid);
}

export function getLastUploadedDayKey(uid) {
  return getScopedStorageKey(LAST_UPLOADED_DAY_KEY, uid);
}

export function getLastSavedTimestampKey(uid) {
  return getScopedStorageKey(LAST_SAVED_TIMESTAMP_KEY, uid);
}

function withOwnerUid(state, uid) {
  if (!state) return state;
  return { ...state, ownerUid: uid || null };
}

function stripLocalMeta(state) {
  if (!state) return state;
  const { ownerUid, ...rest } = state;
  return rest;
}

async function getLegacyLastSavedTime() {
  const stored = await AsyncStorage.getItem(LAST_SAVED_TIMESTAMP_KEY);
  return stored ? Number(stored) : 0;
}

async function getLastSavedTime(uid, lastTimestamp) {
  if (lastTimestamp !== undefined) return lastTimestamp;

  const stored = await AsyncStorage.getItem(getLastSavedTimestampKey(uid));
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

async function ensureScheduleFromPreferences(state, lastSavedTimestamp, uid) {
  if (!auth.currentUser || state?.schedule) return state;

  const userSchedule = await getFastingSchedule(auth.currentUser.uid);
  if (!userSchedule) return state;

  const nextSchedule = userSchedule.timeZone
    ? userSchedule
    : { ...userSchedule, timeZone: getResolvedTimeZone() };
  if (!userSchedule.timeZone) {
    await setFastingScheduleDb(auth.currentUser.uid, nextSchedule);
  }

  const nextState = { ...state, schedule: nextSchedule };
  await AsyncStorage.setItem(
    getStateStorageKey(uid),
    JSON.stringify(withOwnerUid(nextState, uid))
  );
  if (lastSavedTimestamp) {
    await AsyncStorage.setItem(
      getLastSavedTimestampKey(uid),
      String(lastSavedTimestamp)
    );
  }

  return nextState;
}

function ensureScheduleTimeZone(state) {
  if (!state?.schedule) return state;
  const timeZone = state.schedule.timeZone || getResolvedTimeZone();
  return {
    ...state,
    schedule: {
      ...state.schedule,
      timeZone,
    },
  };
}

function waitForAuthUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user || null);
    });
  });
}

// helper that computes the current day stats from the current state
export function buildCurrentDayStats(state, now = new Date()) {
  const timeZone = getScheduleTimeZone(state.schedule);
  const dayString = formatDayString(now, timeZone);
  const hoursToday = hoursFastedToday(state, now.getTime());
  const scheduleHours = state.schedule?.fastingHours ?? undefined;

  // You can choose if you want to pass today’s events or not
  const eventsToday = (state.events || []).filter(
    (event) => event.ts >= startOfDayTs(now, timeZone)
  );

  return {
    day: dayString,
    hoursFasted: hoursToday,
    scheduleHours,
    events: eventsToday,
    timeZone,
    dayStartUtc: startOfDayTs(now, timeZone),
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
      const uid = auth.currentUser?.uid || null;
      const stateToSave = withOwnerUid({ ...state }, uid);
      delete stateToSave.hours;

      await AsyncStorage.setItem(
        getStateStorageKey(uid),
        JSON.stringify(stateToSave)
      );
      await AsyncStorage.setItem(
        getLastSavedTimestampKey(uid),
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
      const uid = auth.currentUser?.uid || null;
      const rawState = await AsyncStorage.getItem(getStateStorageKey(uid));
      const parsedState = rawState
        ? JSON.parse(rawState)
        : withOwnerUid(getInitialState(), uid);

      const updatedEvents = [
        ...(parsedState.events || []),
        { ts: timestamp, type, trigger },
      ];
      parsedState.events = updatedEvents;

      await AsyncStorage.setItem(
        getStateStorageKey(uid),
        JSON.stringify(withOwnerUid(parsedState, uid))
      );
      await AsyncStorage.setItem(
        getLastSavedTimestampKey(uid),
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
    async (day, hours, scheduleHours, events = [], metadata = {}) => {
      if (!auth.currentUser) return;
      try {
        const uid = auth.currentUser.uid;
        await addDailyStatsDb(uid, day, hours, scheduleHours, events, metadata);
        await AsyncStorage.setItem(getLastUploadedDayKey(uid), day);
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
      const uid = auth.currentUser?.uid || null;
      const raw = await AsyncStorage.getItem(getStateStorageKey(uid));
      if (!raw) return;

      const parsed = JSON.parse(raw);
      parsed.events = events;

      await AsyncStorage.setItem(
        getStateStorageKey(uid),
        JSON.stringify(withOwnerUid(parsed, uid))
      );
      await AsyncStorage.setItem(
        getLastSavedTimestampKey(uid),
        Date.now().toString()
      );
    } catch (error) {
      logWarn("[fasting-persistence] saveDailyEvents() failed:", error);
    }
  }, []);

  /**
   * Clean up and process the current fasting state.
   * - Trims historical events to a rolling horizon.
   * - Uploads yesterday’s data if needed.
   * - Cleans up events for today.
   */
  const processLoadedState = useCallback(
    async (parsedState) => {
      delete parsedState.hours;

      const now = new Date();

      const normalizedEvents = normalizeEventTimestamps(
        parsedState.events || []
      );

      const validEvents = removeFutureEvents(normalizedEvents, now);
      const timeZone = getScheduleTimeZone(parsedState.schedule);
      const trimmedEvents = trimEventsToHorizon(validEvents, now, timeZone);

      if (trimmedEvents.length !== validEvents.length) {
        logWarn(
          "[fasting-persistence] Trimmed fasting events outside the horizon."
        );
      }

      await updateStoredEvents(
        parsedState,
        normalizedEvents,
        trimmedEvents,
        now,
        normalizedEvents.length,
        saveDailyEvents
      );

      return ensureScheduleTimeZone(parsedState);
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
      let currentUser = auth.currentUser;
      if (!currentUser) {
        currentUser = await waitForAuthUser();
      }

      const uid = currentUser?.uid || null;
      const localData = await AsyncStorage.getItem(getStateStorageKey(uid));
      let localState = localData ? JSON.parse(localData) : null;
      let localLastSavedTime = await getLastSavedTime(uid);

      if (!localState && uid) {
        const legacyData = await AsyncStorage.getItem(STORAGE_KEY);
        const legacyState = legacyData ? JSON.parse(legacyData) : null;
        if (legacyState?.ownerUid === uid) {
          localState = legacyState;
          localLastSavedTime = await getLegacyLastSavedTime();
          await AsyncStorage.setItem(
            getStateStorageKey(uid),
            JSON.stringify(withOwnerUid(legacyState, uid))
          );
          if (localLastSavedTime) {
            await AsyncStorage.setItem(
              getLastSavedTimestampKey(uid),
              String(localLastSavedTime)
            );
          }
        }
      }

      if (localState?.ownerUid && uid && localState.ownerUid !== uid) {
        localState = null;
        localLastSavedTime = 0;
      }

      if (currentUser) {
        const remoteState = await getFastingStateDb(currentUser.uid);
        if (remoteState) {
          const remoteUpdatedAtMs = getRemoteUpdatedAtMs(remoteState);
          const { lastUpdatedAt, lastTs, ...cleanState } = remoteState;
          const remoteTimestamp = remoteUpdatedAtMs || lastTs || 0;
          const localIsNewer =
            localState && localLastSavedTime >= remoteTimestamp;

          if (!localState || !localIsNewer) {
            let normalizedState = {
              ...cleanState,
              lastUpdatedAt: remoteUpdatedAtMs || undefined,
            };

            normalizedState = await ensureScheduleFromPreferences(
              normalizedState,
              remoteTimestamp,
              uid
            );
            await AsyncStorage.setItem(
              getStateStorageKey(uid),
              JSON.stringify(withOwnerUid(normalizedState, uid))
            );
            if (remoteTimestamp) {
              await AsyncStorage.setItem(
                getLastSavedTimestampKey(uid),
                String(remoteTimestamp)
              );
            }

            return await processLoadedState(normalizedState, remoteTimestamp);
          }

          const hydratedLocalState = await ensureScheduleFromPreferences(
            localState,
            localLastSavedTime,
            uid
          );
          await setFastingStateDb(
            auth.currentUser.uid,
            stripLocalMeta(hydratedLocalState)
          );
          return await processLoadedState(
            hydratedLocalState,
            localLastSavedTime
          );
        }
      }

      if (localState) {
        const hydratedLocalState = currentUser
          ? await ensureScheduleFromPreferences(
              localState,
              localLastSavedTime,
              uid
            )
          : localState;
        return await processLoadedState(hydratedLocalState, localLastSavedTime);
      }
      if (currentUser) {
        const userSchedule = await getFastingSchedule(currentUser.uid);

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
