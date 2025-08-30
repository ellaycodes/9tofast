import { db } from "./app";
import { setDoc, doc, getDoc } from "firebase/firestore";

export async function getFastingSchedule(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "settings", "preferences")
    );
    return docSnap.data().fastingSchedule ?? null;
  } catch (error) {
    console.warn("getFastingSchedule", error);
  }
}

export async function getPreferences(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "settings", "preferences")
    );
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.warn("getPreferences", error);
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
    console.warn("setFastingScheduleDb", error);
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
    console.warn("setThemeDb", error);
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
    console.warn("addDailyStatsDb", error);
  }
}
