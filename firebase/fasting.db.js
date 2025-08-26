import { db } from "./app";
import {
  setDoc,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

export async function getFastingSchedule(uid) {
  try {
    const docSnap = await getDoc(
      doc(db, "users", uid, "settings", "preferences")
    );
    return docSnap.data().fastingSchedule ?? null;
  } catch (err) {
    console.log(err);
  }
}

export async function addFastingEventDb(uid, ts, type, day, trigger) {
  try {
    const docRef = await addDoc(collection(db, "users", uid, "events"), {
      ts: ts,
      type: type,
      day: day,
      trigger: trigger,
      createdAt: serverTimestamp(),
    });
    console.log(docRef.id);
  } catch (e) {
    console.log(e);
  }
}

export async function addDailyStatsDb(uid, day, hoursFastedToday, fastingHours) {
  try {
    await setDoc(doc(db, "users", uid, "daily_stats", day), {
      hoursFastedToday: hoursFastedToday,
      percent: fastingHours,
    });
  } catch (e) {
    console.log(e);
  }
}
