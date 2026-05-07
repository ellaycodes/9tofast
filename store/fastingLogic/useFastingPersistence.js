import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { getInitialState } from "./fasting-session";
import {
  addDailyStatsDb,
  getFastingSchedule,
  getFastingStateDb,
  setFastingScheduleDb,
} from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";
import { onAuthStateChanged } from "firebase/auth";
import { logWarn } from "../../util/logger.js";
import { getResolvedTimeZone } from "../../util/timezone";
import {
  buildWeeklyScheduleFromLegacy,
  flatScheduleFromWeekly,
  isWeeklySchedule,
} from "./data/weekly-schedule.js";

const STORAGE_KEY = "fastingstate_v2";
const WEEKLY_KEY = "weeklySchedule_v1";

function getScopedKey(uid) {
  return `${STORAGE_KEY}:${uid || "anonymous"}`;
}

export function getStateStorageKey(uid) {
  return getScopedKey(uid);
}

export function getWeeklyStorageKey(uid) {
  return `${WEEKLY_KEY}:${uid || "anonymous"}`;
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

/**
 * Loads the WeeklySchedule, migrating from the legacy flat shape if needed.
 * Idempotent: if the new shape is already present in AsyncStorage, returns
 * it immediately without any writes.
 *
 * Order of precedence (fastest first to avoid blocking startup):
 *   1. AsyncStorage cache       – instant, offline-safe
 *   2. In-memory flatSchedule   – already loaded; avoids a second Firestore read
 *   3. Firestore                – only when no flat schedule available (fresh install)
 *
 * Firestore persistence of the migrated value is handled by the auto-save
 * effect in fasting-context after the LOADED action resolves.
 */
async function loadOrMigrateWeeklySchedule(flatSchedule, uid) {
  // 1. AsyncStorage first (fast, offline-capable)
  try {
    const raw = await AsyncStorage.getItem(getWeeklyStorageKey(uid));
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  // 2. Build from the flat schedule that was already loaded into memory.
  //    This avoids a second blocking Firestore read on first launch after
  //    the update.  The auto-save effect persists the result to Firestore.
  if (flatSchedule) {
    const weekly = buildWeeklyScheduleFromLegacy(flatSchedule);
    AsyncStorage.setItem(
      getWeeklyStorageKey(uid),
      JSON.stringify(weekly)
    ).catch(() => {});
    return weekly;
  }

  // 3. No flat schedule in memory (fresh install, no fasting state yet).
  //    Check Firestore in case a schedule was set on another device.
  if (uid) {
    try {
      const remote = await getFastingSchedule(uid);
      if (remote) {
        const weekly = isWeeklySchedule(remote)
          ? remote
          : buildWeeklyScheduleFromLegacy({
              ...remote,
              timeZone: remote.timeZone || getResolvedTimeZone(),
            });
        AsyncStorage.setItem(
          getWeeklyStorageKey(uid),
          JSON.stringify(weekly)
        ).catch(() => {});
        return weekly;
      }
    } catch (_) {}
  }

  return null;
}

export default function useFastingPersistence() {
  /**
   * Load fasting state: Firestore first, AsyncStorage as offline cache.
   * Also loads/migrates the WeeklySchedule and returns it as weeklySchedule.
   */
  const loadFastingState = useCallback(async () => {
    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        currentUser = await waitForAuthUser();
      }
      const uid = currentUser?.uid || null;

      // --- Firestore (source of truth for base fasting state) ---
      let baseState = null;

      if (uid) {
        const remoteState = await getFastingStateDb(uid);
        if (remoteState) {
          const normalized = normalizeState(remoteState);
          if (normalized) {
            await AsyncStorage.setItem(
              getScopedKey(uid),
              JSON.stringify(normalized)
            ).catch(() => {});
            baseState = normalized;
          }
        }
      }

      // --- AsyncStorage (offline cache for base fasting state) ---
      if (!baseState) {
        const localData = await AsyncStorage.getItem(getScopedKey(uid));
        if (localData) {
          const parsed = JSON.parse(localData);
          if (!parsed.ownerUid || parsed.ownerUid === uid) {
            baseState = normalizeState(parsed) ?? getInitialState();
          }
        }
      }

      // --- Bootstrap schedule from preferences if no fasting state found ---
      if (!baseState && uid) {
        const remote = await getFastingSchedule(uid);
        if (remote) {
          let flatSchedule;
          if (isWeeklySchedule(remote)) {
            flatSchedule = flatScheduleFromWeekly(remote);
          } else {
            const tz = remote.timeZone || getResolvedTimeZone();
            flatSchedule = { ...remote, timeZone: tz };
          }
          baseState = { ...getInitialState(), schedule: flatSchedule };
        }
      }

      if (!baseState) baseState = getInitialState();

      // --- Load or migrate the WeeklySchedule ---
      const weeklySchedule = await loadOrMigrateWeeklySchedule(
        baseState.schedule,
        uid
      );

      // Keep state.schedule in sync with today's DayConfig from the weekly model
      let schedule = baseState.schedule;
      if (weeklySchedule) {
        const flat = flatScheduleFromWeekly(weeklySchedule);
        if (flat) schedule = flat;
      }

      return { ...baseState, schedule, weeklySchedule };
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
