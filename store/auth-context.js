import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/app";
import { setFastingStateDb } from "../firebase/fasting.db.js";
import { logWarn } from "../util/logger";
import {
  getLastSavedTimestampKey,
  getLastUploadedDayKey,
  getStateStorageKey,
} from "./fastingLogic/useFastingPersistence.js";

export const AuthContext = createContext({
  token: "",
  username: "",
  emailAddress: "",
  isAuthed: false,
  onboarded: false,
  uid: "",
  fullName: "",
  avatarId: "",
  setEmailAddress: (emailAddress) => {},
  authenticate: (token, userName, uid) => {},
  logout: () => {},
  refreshToken: (idToken) => {},
  updateUsername: (username) => {},
  updateFullName: (fullName) => {},
  updateAvatarId: (avatarId) => {},
  completeOnboarding: () => {},
  setOnboarded: (flag) => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const [username, setUsername] = useState();
  const [fullName, setFullName] = useState();
  const [email, setEmail] = useState();
  const [uid, setUid] = useState();
  const [avatarId, setAvatarId] = useState();
  const [onboarded, setOnboarded] = useState(false);

  function setEmailAddress(email) {
    setEmail(email);
    AsyncStorage.setItem("emailAddress", email);
    return true;
  }

  function authenticate(token, userName, uid) {
    setAuthToken(token);
    setUsername(userName);
    setUid(uid);
    AsyncStorage.setItem("token", token);
    AsyncStorage.setItem("username", userName);
    AsyncStorage.setItem("uid", uid);
  }

  async function logout() {
    try {
      if (uid) {
        const rawState = await AsyncStorage.getItem(getStateStorageKey(uid));
        if (rawState) {
          const parsed = JSON.parse(rawState);
          if (auth && auth.currentUser && auth.currentUser.uid) {
            const { ownerUid, ...rest } = parsed;
            await setFastingStateDb(uid, rest);
          }
        }
      }
    } catch (error) {
      logWarn("[auth-context] logout backup failed", error);
    }
    await signOut(auth);
    setAuthToken(null);
    setUsername(null);
    setUid(null);
    setFullName(null);
    setAvatarId(null);
    setOnboarded(false);
    setEmail(null);
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("username");
    AsyncStorage.removeItem("emailAddress");
    AsyncStorage.removeItem("uid");
    AsyncStorage.removeItem("fullname");
    AsyncStorage.removeItem("avatarId");
    AsyncStorage.removeItem("onboarded");
    if (uid) {
      AsyncStorage.removeItem(getStateStorageKey(uid));
      AsyncStorage.removeItem(getLastSavedTimestampKey(uid));
      AsyncStorage.removeItem(getLastUploadedDayKey(uid));
    }
    AsyncStorage.removeItem("fastingstate_v2");
    AsyncStorage.removeItem("fasting_last_ts");
    AsyncStorage.removeItem("fasting_last_uploaded_day");
  }

  function refreshToken(idToken) {
    setAuthToken(idToken);
    AsyncStorage.setItem("token", idToken);
  }

  function updateUsername(username) {
    setUsername(username);
    AsyncStorage.setItem("username", username);
  }

  function updateFullName(fullName) {
    setFullName(fullName);
    AsyncStorage.setItem("fullname", fullName);
  }

  function updateAvatarId(id) {
    setAvatarId(id);
    AsyncStorage.setItem("avatarId", id);
  }

  function completeOnboarding() {
    setOnboarded(true);
    AsyncStorage.setItem("onboarded", "true");
  }

  function setOnboardedState(flag) {
    setOnboarded(flag);
    if (flag) {
      AsyncStorage.setItem("onboarded", "true");
    } else {
      AsyncStorage.removeItem("onboarded");
    }
  }

  const value = {
    token: authToken,
    username: username,
    emailAddress: email,
    isAuthed: !!authToken,
    onboarded: onboarded,
    uid: uid,
    fullName: fullName,
    avatarId: avatarId,
    setEmailAddress: setEmailAddress,
    authenticate: authenticate,
    logout: logout,
    refreshToken: refreshToken,
    updateUsername: updateUsername,
    updateFullName: updateFullName,
    updateAvatarId: updateAvatarId,
    completeOnboarding: completeOnboarding,
    setOnboarded: setOnboardedState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
