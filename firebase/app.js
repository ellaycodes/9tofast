import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";

const extra =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  Updates.manifest?.extra ??
  {};

const firebaseConfig = {
  apiKey: extra?.firebaseApiKey,
  authDomain: extra?.firebaseAuthDomain,
  projectId: extra?.firebaseProjectId,
};

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length) {
  const message = `Missing Firebase configuration values for: ${missingConfigKeys.join(
    ", "
  )}`;
  console.error(message);
  throw new Error(message);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

export { app, db, auth };
