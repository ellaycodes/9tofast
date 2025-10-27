import { StatusBar } from "expo-status-bar";
import AuthStack from "./navigation/AuthStack";
import AppThemeContextProvider, {
  useAppTheme,
} from "./store/app-theme-context";
import { useContext, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthContextProvider, { AuthContext } from "./store/auth-context";
import { NavigationContainer } from "@react-navigation/native";
import AppTabs from "./navigation/AppTabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import FastingContextProvider from "./store/fastingLogic/fasting-context";
import { Ionicons } from "@expo/vector-icons";
import { auth, getFirebaseConfig } from "./firebase/app";
import { getUser } from "./firebase/users.db.js";
import {
  onAuthStateChanged,
  getIdToken,
  onIdTokenChanged,
} from "firebase/auth";
import { Buffer } from "buffer";
import { logWarn } from "./util/logger.js";
import { Text } from "react-native";

function isTokenExpired(token) {
  console.log("Esther! token");
  try {
    const base64 = token.split(".")[1];
    const payload =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf8");
    const { exp } = JSON.parse(payload);
    return exp * 1000 <= Date.now();
  } catch (e) {
    return true;
  }
}

function Navigator() {
  console.log("Esther! Navigator");

  const authCxt = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000);
    Ionicons.loadFont();
    const verifyStoredToken = async () => {
      try {
        const [token, storedUsername, storedUid] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("username"),
          AsyncStorage.getItem("uid"),
        ]);
        if (token && storedUsername && storedUid) {
          if (isTokenExpired(token)) {
            authCxt.logout();
          } else {
            authCxt.authenticate(token, storedUsername, storedUid);
          }
        }
      } catch (err) {
        logWarn("verifyStoredToken", err);
        authCxt.logout();
      }
    };
    verifyStoredToken();

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await getIdToken(user, true);
          const { displayName, email, uid } = user;
          authCxt.authenticate(token, displayName, uid);
          if (email) authCxt.setEmailAddress(email);

          try {
            const userData = await getUser(uid);
            if (userData?.fullName) authCxt.updateFullName(userData.fullName);
            if (userData?.avatarId) authCxt.updateAvatarId(userData.avatarId);
          } catch (error) {
            console.warn("hydrateUser", error);
          }
          const storedOnboarded = await AsyncStorage.getItem("onboarded");
          if (storedOnboarded === "true") authCxt.setOnboarded(true);
        } finally {
          setLoading(false);
        }
      } else {
        authCxt.logout();
        setLoading(false);
      }
    });
    const unsubToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await getIdToken(user, true);
        authCxt.refreshToken(token);
      }
    });
    return () => {
      unsubAuth();
      unsubToken();
      clearTimeout(timeout);
    };
  }, [authCxt]);

  if (loading) {
    return <LoadingOverlay>Loading</LoadingOverlay>;
  }

  return (
    <NavigationContainer>
      {authCxt.isAuthed && authCxt.onboarded ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getFirebaseConfig()
      .then(() => setReady(true))
      .catch((e) => console.error(e));
  }, []);

  if (!ready) return <Text>Loading...</Text>

  return (
    <>
      <AuthContextProvider>
        <AppThemeContextProvider>
          <InnerApp />
        </AppThemeContextProvider>
      </AuthContextProvider>
    </>
  );
}

function InnerApp() {
  console.log("Esther! inner App");
  const { theme } = useAppTheme();
  return (
    <FastingContextProvider>
      <SafeAreaProvider>
        <StatusBar style={theme.statusbar} />
        <Navigator />
      </SafeAreaProvider>
    </FastingContextProvider>
  );
}
