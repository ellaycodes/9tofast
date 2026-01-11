import { db } from "./app";
import {
  doc,
  endAt,
  query,
  setDoc,
  getDoc,
  serverTimestamp,
  orderBy,
  startAt,
  getDocs,
  collection,
  documentId,
  waitForPendingWrites,
  runTransaction,
} from "firebase/firestore";
import { logWarn } from "../util/logger";

function mergeDailyEvents(existingEvents = [], incomingEvents = []) {
  const merged = new Map();
  [...existingEvents, ...incomingEvents].forEach((event) => {
    const key = `${event?.ts ?? ""}|${event?.type ?? ""}|${
      event?.trigger ?? ""
    }`;
    merged.set(key, event);
  });
  return Array.from(merged.values()).sort(
    (a, b) => (a?.ts ?? 0) - (b?.ts ?? 0)
  );
}

export async function getFastingSchedule(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "settings", "preferences")
    );
    if (!docSnap.exists()) {
      return null;
    }
    const data = docSnap.data();
    return data && data.fastingSchedule !== undefined
      ? data.fastingSchedule
      : null;
  } catch (error) {
    logWarn("getFastingSchedule", error);
  }
}

export async function getPreferences(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "settings", "preferences")
    );
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    logWarn("getPreferences", error);
  }
}

export async function setFastingScheduleDb(uid, schedule) {
  try {
    await setDoc(
      doc(db, "users", uid, "settings", "preferences"),
      { fastingSchedule: schedule },
      { merge: true }
    );
  } catch (error) {
    logWarn("setFastingScheduleDb", error);
  }
}

export async function setThemeDb(uid, theme) {
  try {
    await setDoc(
      doc(db, "users", uid, "settings", "preferences"),
      { theme },
      { merge: true }
    );
  } catch (error) {
    logWarn("setThemeDb", error);
  }
}

export async function addDailyStatsDb(
  uid,
  day,
  hoursFastedToday,
  fastingHours,
  events = [],
  metadata = {}
) {
  try {
    const docRef = doc(db, "users", uid, "daily_stats", day);
    const incomingHours =
      typeof hoursFastedToday === "number" ? hoursFastedToday : 0;
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      const existing = docSnap.exists() ? docSnap.data() : {};
      const existingHours =
        typeof existing.hoursFastedToday === "number"
          ? existing.hoursFastedToday
          : 0;
      const mergedHours = Math.max(existingHours, incomingHours);
      const mergedEvents = mergeDailyEvents(
        existing.events || [],
        events || []
      );
      const percent =
        typeof fastingHours === "number" && fastingHours > 0
          ? Math.round((mergedHours / fastingHours) * 100)
          : typeof existing.percent === "number"
          ? existing.percent
          : 0;

      transaction.set(
        docRef,
        {
          hoursFastedToday: mergedHours,
          percent,
          events: mergedEvents,
          updatedAt: serverTimestamp(),
          timeZone: metadata.timeZone,
          dayStartUtc: metadata.dayStartUtc,
        },
        { merge: true }
      );
    });
  } catch (error) {
    logWarn("addDailyStatsDb", error);
  }
}

export async function getDailyStatsDb(uid, day) {
  try {
    const docSnap = await getDoc(doc(db, "users", uid, "daily_stats", day));
    await waitForPendingWrites(db);
    const data = docSnap.exists() ? docSnap?.data() : null;
    if (!data) return;
    return data;
  } catch (error) {
    logWarn("getDailyStatsDb", error);
  }
}

export async function getDailyStatsRange(uid, startDay, endDay) {
  try {
    const statsQuery = query(
      collection(db, "users", uid, "daily_stats"),
      orderBy(documentId()),
      startAt(startDay),
      endAt(endDay)
    );
    const querySnapshot = await getDocs(statsQuery);
    const stats = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        day: docSnap.id,
        hoursFastedToday: data.hoursFastedToday,
        percent: data.percent,
        events: data.events || [],
      };
    });
    return stats.sort((a, b) => a.day.localeCompare(b.day));
  } catch (error) {
    logWarn("getDailyStatsRange", error);
    return [];
  }
}

export async function setFastingStateDb(uid, state) {
  try {
    await setDoc(doc(db, "users", uid, "fasting_state", "current"), {
      ...state,
      lastUpdatedAt: serverTimestamp(),
    });
  } catch (error) {
    logWarn("setFastingStateDb", error);
  }
}

export async function getFastingStateDb(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "fasting_state", "current")
    );
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    logWarn("getFastingStateDb", error);
  }
}
