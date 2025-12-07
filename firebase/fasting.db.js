import { db } from "./app";
import {
  doc,
  endAt,
  query,
  setDoc,
  getDoc,
  orderBy,
  startAt,
  getDocs,
  collection,
  documentId,
  waitForPendingWrites,
} from "firebase/firestore";
import { logWarn } from "../util/logger";
import { hoursFastedToday } from "../store/fastingLogic/fasting-session";

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
  events = []
) {
  try {
    await setDoc(doc(db, "users", uid, "daily_stats", day), {
      hoursFastedToday: hoursFastedToday,
      percent:
        typeof fastingHours === "number" && fastingHours > 0
          ? Math.round((hoursFastedToday / fastingHours) * 100)
          : 0,
      events,
    });
  } catch (error) {
    logWarn("addDailyStatsDb", error);
  }
}

export async function getDailyStatsDb(uid, day) {
  try {
    const docSnap = await getDoc(doc(db, "users", uid, "daily_stats", day));
    await waitForPendingWrites(db);
    const data = docSnap.exists() ? docSnap.data() : null;
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
    await setDoc(doc(db, "users", uid, "fasting_state", "current"), state);
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
