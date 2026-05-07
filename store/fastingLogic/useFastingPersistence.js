import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { getInitialState } from "./fasting-session";
import {
  addDailyStatsDb,
  getFastingSchedule,
  getFastingStateDb,
} from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";
import { onAuthStateChanged } from "firebase/auth";
import { logWarn } from "../../util/logger.js";
import { getResolvedTimeZone } from "../../util/timezone";

const STORAGE_KEY = "fastingstate_v2";

function getScopedKey(uid) {
  return `${STORAGE_KEY}:${uid || "anonymous"}`;
}

export function getStateStorageKey(uid) {
  return getScopedKey(uid);
}

function waitForAuthUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user || null);
    });
  });
}

function cleanEvents(events = []) {
  const now = Date.now();
  return events
    .filter((e) => e && typeof e.ts === "number" && e.ts <= now)
    .sort((a, b) => a.ts - b.ts);
}

function normalizeState(raw) {
  if (!raw) return null;
  const { lastUpdatedAt, lastTs, ownerUid, hours, ...state } = raw;
  const events = cleanEvents(state.events);

  const schedule =
    state.schedule && !state.schedule.timeZone
      ? { ...state.schedule, timeZone: getResolvedTimeZone() }
      : state.schedule ?? null;

  return { ...state, events, schedule };
}

export default function useFastingPersistence() {
  /**
   * Load fasting state: Firestore first, AsyncStorage as offline cache.
   */
  const loadFastingState = useCallback(async () => {
    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        currentUser = await waitForAuthUser();
      }
      const uid = currentUser?.uid || null;

      // --- Firestore (source of truth) ---
      if (uid) {
        const remoteState = await getFastingStateDb(uid);
        if (remoteState) {
          const normalized = normalizeState(remoteState);
          if (normalized) {
            // Warm the local cache
            await AsyncStorage.setItem(
              getScopedKey(uid),
              JSON.stringify(normalized)
            ).catch(() => {});
            return normalized;
          }
        }
      }

      // --- AsyncStorage (offline cache) ---
      const localData = await AsyncStorage.getItem(getScopedKey(uid));
      if (localData) {
        const parsed = JSON.parse(localData);
        // Reject data that belongs to a different user
        if (!parsed.ownerUid || parsed.ownerUid === uid) {
          return normalizeState(parsed) ?? getInitialState();
        }
      }

      // --- Bootstrap from schedule only ---
      if (uid) {
        const schedule = await getFastingSchedule(uid);
        if (schedule) {
          const tz = schedule.timeZone || getResolvedTimeZone();
          return { ...getInitialState(), schedule: { ...schedule, timeZone: tz } };
        }
      }

      return getInitialState();
    } catch (error) {
      logWarn("[fasting-persistence] load failed:", error);
      return getInitialState();
    }
  }, []);

  /**
   * Upload one day's fasting summary to Firestore.
   */
  const uploadDailyStats = useCallback(
    async (day, hours, scheduledHours, events = [], metadata = {}) => {
      if (!auth.currentUser) return;
      try {
        await addDailyStatsDb(
          auth.currentUser.uid,
          day,
          hours,
          scheduledHours,
          events,
          metadata
        );
      } catch (error) {
        logWarn("[fasting-persistence] uploadDailyStats failed:", error);
        throw error;
      }
    },
    []
  );

  return { load: loadFastingState, uploadDailyStats };
}
