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
import { auth, firebaseConfig } from "./firebase/app";
import { getUser } from "./firebase/users.db.js";
import {
  onAuthStateChanged,
  getIdToken,
  onIdTokenChanged,
} from "firebase/auth";
import { Text } from "react-native";

function Navigator() {
  const authCxt = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000);
    Ionicons.loadFont();

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await getIdToken(user);
          const { displayName, email, uid } = user;
          authCxt.authenticate(token, displayName, uid);
          if (email) authCxt.setEmailAddress(email);

          try {
            const userData = await getUser(uid);
            if (userData && userData.fullName) {
              authCxt.updateFullName(userData.fullName);
            }
            if (userData && userData.avatarId) {
              authCxt.updateAvatarId(userData.avatarId);
            }
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
        const token = await getIdToken(user);
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
    return (
      <>
        <LoadingOverlay>Loading</LoadingOverlay>
      </>
    );
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
    if (firebaseConfig?.apiKey !== undefined) {
      setReady(true);
    }
  }, []);

  if (!ready) return <Text>Loading...</Text>;

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
  const { theme } = useAppTheme();
  return (
    <>
      <FastingContextProvider>
        <SafeAreaProvider>
          <StatusBar style={theme.statusbar} />
          <Navigator />
        </SafeAreaProvider>
      </FastingContextProvider>
    </>
  );
}
