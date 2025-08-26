import { db } from "./app";
import { setDoc, doc, getDoc } from "firebase/firestore";

export async function getFastingSchedule(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "settings", "preferences")
    );
    return docSnap.data().fastingSchedule ?? null;
  } catch (err) {
    console.log("getFastingSchedule", err);
  }
}

export async function getPreferences(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "settings", "preferences")
    );
    return docSnap.exists() ? docSnap.data() : null;
  } catch (err) {
    console.log("getPreferences", err);
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
    console.log("setFastingScheduleDb", e);
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
    console.log("setThemeDb", e);
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
      percent: fastingHours,
      events,
    });
  } catch (e) {
    console.log("addDailyStatsDb", e);
  }
}
