import { db } from "./app";
import { setDoc, doc, getDoc } from "firebase/firestore";

export async function getFastingSchedule(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "settings", "preferences")
    );
    return docSnap.data().fastingSchedule ?? null;
  } catch (err) {
    console.warn("getFastingSchedule", err);
  }
}

export async function getPreferences(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "settings", "preferences")
    );
    return docSnap.exists() ? docSnap.data() : null;
  } catch (err) {
    console.warn("getPreferences", err);
  }
}

export async function setFastingScheduleDb(uid, schedule) {
  try {
    await setDoc(
      doc(db, "users", uid, "settings", "preferences"),
      { fastingSchedule: schedule },
      { merge: true }
    );
  } catch (e) {
    console.warn("setFastingScheduleDb", e);
  }
}

export async function setThemeDb(uid, theme) {
  try {
    await setDoc(
      doc(db, "users", uid, "settings", "preferences"),
      { theme },
      { merge: true }
    );
  } catch (e) {
    console.warn("setThemeDb", e);
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
  } catch (e) {
    console.warn("addDailyStatsDb", e);
  }
}
