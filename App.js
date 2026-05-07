import { useContext, useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import {
  onAuthStateChanged,
  getIdToken,
  onIdTokenChanged,
} from "firebase/auth";

import AuthStack from "./navigation/AuthStack";
import AppTabs from "./navigation/AppTabs";

import AppThemeContextProvider, {
  useAppTheme,
} from "./store/app-theme-context";
import AuthContextProvider, { AuthContext } from "./store/auth-context";
import FastingContextProvider from "./store/fastingLogic/fasting-context";
import StatsContextProvider, {
  StatsContext,
} from "./store/statsLogic/stats-context.js";

import LoadingOverlay from "./components/ui/LoadingOverlay";

import { auth, firebaseConfig } from "./firebase/app";
import { getUser } from "./firebase/users.db.js";
import { useFasting } from "./store/fastingLogic/fasting-context";

import {
  scheduleStreakNotifications,
  scheduleStreakRiskNotification,
  cancelStreakRiskNotification,
  scheduleEatingWindowNotification,
  cancelEatingWindowNotification,
  allowNotificationsAsync,
} from "./notifications/index.js";
import MobileAdsConfig from "./components/monetising/AdsConfig.js";
import { PremiumProvider, usePremium } from "./store/premium-context.js";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
    };
  },
});

function Navigator() {
  const authCxt = useContext(AuthContext);
  const { premiumLogIn, premiumLogOut } = usePremium();
  const [loading, setLoading] = useState(true);
  const { loadStreak, currentStreak } = useContext(StatsContext);
  const { weeklySchedule } = useFasting();

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000);
    Ionicons.loadFont();
    loadStreak();

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await premiumLogIn(user.uid);
          const token = await getIdToken(user);
          const { email, uid } = user;

          let userData = null;
          try {
            userData = await getUser(uid);
          } catch (err) {
            console.warn("getUser failed:", err);
          }
          const dbDisplayName = userData?.displayName || "";
          const dbAvatarId = userData?.avatarId || null;
          const authFullName = userData?.fullName || "";

          const authDisplayName = authFullName;

          authCxt.authenticate(token, dbDisplayName, uid);

          if (email) {
            authCxt.setEmailAddress(email);
          }

          if (authDisplayName) {
            authCxt.updateFullName(authDisplayName);
          }

          if (dbAvatarId) {
            authCxt.updateAvatarId(dbAvatarId);
          }

          const storedOnboarded = await AsyncStorage.getItem("onboarded");
          if (storedOnboarded === "true") {
            authCxt.setOnboarded(true);
          }
        } finally {
          setLoading(false);
        }
      } else {
        await premiumLogOut();
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
  }, [authCxt, premiumLogIn, premiumLogOut]);

  useEffect(() => {
    async function setupNotifications() {
      const granted = await allowNotificationsAsync();
      if (!granted) return;
      await scheduleStreakNotifications(["08:00", "20:00"]);
    }

    if (authCxt.isAuthed && authCxt.onboarded) {
      setupNotifications();
    }
  }, [authCxt.isAuthed, authCxt.onboarded]);

  // Debounce notification reschedule so rapid changes (e.g. Copy To 5 days)
  // only trigger a single cancel+reschedule pass.
  const rescheduleTimerRef = useRef(null);

  useEffect(() => {
    if (rescheduleTimerRef.current) clearTimeout(rescheduleTimerRef.current);

    if (!authCxt.isAuthed || !authCxt.onboarded || !weeklySchedule) {
      cancelStreakRiskNotification();
      cancelEatingWindowNotification();
      return;
    }

    rescheduleTimerRef.current = setTimeout(async () => {
      await scheduleEatingWindowNotification(weeklySchedule);
      if (currentStreak >= 3) {
        await scheduleStreakRiskNotification(weeklySchedule);
      } else {
        await cancelStreakRiskNotification();
      }
    }, 300);

    return () => {
      if (rescheduleTimerRef.current) clearTimeout(rescheduleTimerRef.current);
    };
  }, [currentStreak, weeklySchedule, authCxt.isAuthed, authCxt.onboarded]);

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
    const init = async () => {
      if (firebaseConfig?.apiKey !== undefined) {
        await MobileAdsConfig();
        setReady(true);
      }
    };
    init();
  }, []);

  if (!ready) return <Text>Loading...</Text>;

  return (
    <>
      <AuthContextProvider>
        <PremiumProvider>
          <AppThemeContextProvider>
            <InnerApp />
          </AppThemeContextProvider>
        </PremiumProvider>
      </AuthContextProvider>
    </>
  );
}

function InnerApp() {
  const { theme } = useAppTheme();

  return (
    <>
      <FastingContextProvider>
        <StatsContextProvider>
          <SafeAreaProvider>
            <StatusBar style={theme.statusbar} />
            <Navigator />
          </SafeAreaProvider>
        </StatsContextProvider>
      </FastingContextProvider>
    </>
  );
}
