import { db } from "./app";
import {
  setDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

export async function addUser({
  uid,
  email,
  displayName,
  fullName,
  isAnonymous,
}) {
  if (!uid) throw new Error("ADD_USER_MISSING_UID");

  const data = {
    email: email ? email.toLowerCase() : null,
    displayName: displayName ?? null,
    fullName: fullName ?? null,
    isAnonymous: !!isAnonymous,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", uid), data);
  await setDoc(doc(db, "users", uid, "settings", "preferences"), {
    fastingSchedule: null,
    theme: "Original",
  });
  return { status: "user created" };
}

export async function getUser(uid) {
  if (!uid) throw new Error("GET_USER_MISSING_UID");
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.warn("getUser", error);
  }
}

export async function updateUser(uid, partial) {
  if (!uid) throw new Error("UPDATE_USER_MISSING_UID");
  if (!partial || typeof partial !== "object") throw new Error("BAD_PARTIAL");

  const patch = {};
  for (const [k, v] of Object.entries(partial)) {
    if (v !== undefined) patch[k] = v;
  }

  if (Object.keys(patch).length === 0) return { status: "noop" };

  patch.updatedAt = serverTimestamp();

  try {
    await updateDoc(doc(db, "users", uid), patch);
    return { status: "user updated" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteCurrentUser(uid) {
  if (!uid) throw new Error("DELETE_USER_MISSING_UID");

  try {
    await deleteDoc(doc(db, "users", uid));
  } catch (error) {
    throw error;
  }
}
