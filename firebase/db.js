import { db } from "./app";
import {
  setDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
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
  return { status: "user created" };
}

export async function updateUser({ uid, displayName, fullName, email }) {
  if (!uid) throw new Error("UPDATE_USER_MISSING_UID");

  const patch = {
    displayName: displayName ?? null,
    fullName: fullName ?? null,
    email: email ? email.toLowerCase() : null,
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, "users", uid), patch);
    return { status: "user updated" };
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}

export async function deleteCurrentUser(uid) {
  if (!uid) throw new Error("DELETE_USER_MISSING_UID");

  try {
    await deleteDoc(doc(db, "users", uid));
  } catch (e) {
    throw new Error(e);
  }
}
