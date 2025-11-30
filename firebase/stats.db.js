import { db } from "./app";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { logWarn } from "../util/logger";

export async function setStreak(uid, streaks) {
  try {
    await setDoc(doc(db, "users", uid, "settings", "stats"), streaks);
  } catch (err) {
    logWarn("There was an error adding streak", err);
  }
}

export async function getStreak(uid) {
  try {
    const docSnap = await getDoc(doc(db, "users", uid, "settings", "stats"));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (err) {
    logWarn("There was an error getting streak", err);
  }
}
