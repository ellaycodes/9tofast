import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useState, useEffect } from "react";
import { getStreak, setStreak } from "../../firebase/stats.db.js";
import { auth } from "../../firebase/app.js";
import { onAuthStateChanged } from "firebase/auth";
import { dayQualifier, fastingQualifier } from "./qualifier.js";
import { useFasting } from "../fastingLogic/fasting-context.js";
import { yesterdayHoursFasted } from "./yesterdayHours.js";
import {
  addDaysInTimeZone,
  formatDayString,
  getScheduleTimeZone,
} from "../../util/timezone";
import {
  getDayConfig,
  getDayKey,
} from "../fastingLogic/data/weekly-schedule.js";

export const StatsContext = createContext({
  currentStreak: 0,
  longestStreak: 0,
  previousStreak: 0,
  lastStreakDate: null,
  incrementStreak: () => {},
  breakStreak: () => {},
  overrideStreak: () => {},
  canOverrideStreak: () => {},
  loadStreak: () => {},
  statsLogout: async () => {},
});

function StatsContextProvider({ children }) {
  const { schedule, weeklySchedule } = useFasting();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastStreakDate, setLastStreakDate] = useState(null);
  const [lastOverrideDate, setLastOverrideDate] = useState(null);
  const [hoursFastedYesterday, setHoursFastedYesterday] = useState(null);
  const [userId, setUserId] = useState(() => auth.currentUser?.uid ?? null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });
    return unsub;
  }, []);

  const oneDay = 24 * 60 * 60 * 1000;
  const timeZone = getScheduleTimeZone(schedule);
  const today = formatDayString(new Date(), timeZone);
  const yesterday = formatDayString(
    addDaysInTimeZone(Date.now(), -1, timeZone),
    timeZone
  );
  const fastingGoalHours = schedule?.fastingHours;

  const STREAK_DATA = "streak_data";

  async function loadStreak() {
    if (!auth.currentUser) return;

    let dbData;

    dbData = await getStreak(auth?.currentUser?.uid);

    if (!dbData) {
      const raw = await AsyncStorage.getItem(STREAK_DATA);
      if (!raw) return;
      dbData = JSON.parse(raw);
    }

    setCurrentStreak(dbData.currentStreak ?? 0);
    setLongestStreak(dbData.longestStreak ?? 0);
    setPreviousStreak(dbData.previousStreak ?? 0);
    setLastStreakDate(dbData.lastStreakDate ?? null);
    setLastOverrideDate(dbData.lastOverrideDate ?? null);
  }

  //Load Data on app open
  useEffect(() => {
    async function yesterdayHoursFromDb() {
      const yesterdayData = await yesterdayHoursFasted(timeZone);
      setHoursFastedYesterday(yesterdayData);
    }

    yesterdayHoursFromDb();

    loadStreak();
  }, [userId, timeZone]);

  async function save(streakData) {
    await AsyncStorage.setItem(STREAK_DATA, JSON.stringify(streakData));
    if (auth.currentUser) {
      await setStreak(auth.currentUser.uid, streakData);
    }
  }

  async function incrementStreak() {
    const today = formatDayString(new Date(), timeZone);
    const newStreak = currentStreak + 1;
    const newLongest = Math.max(newStreak, longestStreak);

    setCurrentStreak(newStreak);
    setLongestStreak(newLongest);
    setLastStreakDate(today);

    await save({
      currentStreak: newStreak,
      longestStreak: newLongest,
      previousStreak,
      lastStreakDate: today,
      lastOverrideDate,
    });
  }

  async function breakStreak() {
    const yesterday = formatDayString(addDaysInTimeZone(Date.now(), -1, timeZone), timeZone);
    const updatedLongest = Math.max(currentStreak, longestStreak);

    setPreviousStreak(currentStreak);
    setCurrentStreak(0);
    setLongestStreak(updatedLongest);
    setLastStreakDate(yesterday);

    await save({
      currentStreak: 0,
      longestStreak: updatedLongest,
      previousStreak: currentStreak,
      lastStreakDate: yesterday,
      lastOverrideDate,
    });
  }

  async function overrideStreak() {
    const today = formatDayString(new Date(), timeZone);
    if (!canOverrideStreak().canOverride) return;

    const restoredStreak = previousStreak + 1;
    const newLongestStreak = Math.max(restoredStreak, longestStreak);

    setCurrentStreak(restoredStreak);
    setLongestStreak(newLongestStreak);
    setLastOverrideDate(today);
    setLastStreakDate(today);

    await save({
      currentStreak: restoredStreak,
      longestStreak: newLongestStreak,
      previousStreak,
      lastStreakDate: today,
      lastOverrideDate: today,
    });
  }

  function canOverrideStreak(cooldownDays = 30) {
    let canOverride;
    let diffInDays;
    if (lastOverrideDate === null || lastOverrideDate === undefined) {
      canOverride = true;
      diffInDays = null;
    } else {
      const last = new Date(lastOverrideDate);
      const now = new Date(today);
      diffInDays = Number(Math.floor((now - last) / oneDay));
      canOverride = diffInDays >= cooldownDays;
    }
    return { canOverride, diffInDays };
  }

  async function statsLogout() {
    // Capture uid before signOut can null out auth.currentUser
    const uid = auth.currentUser?.uid;

    setCurrentStreak(0);
    setLongestStreak(0);
    setPreviousStreak(0);
    setLastStreakDate(null);
    setLastOverrideDate(null);

    // Build from literal zeros — setState above is async so closure values are stale
    const streakData = {
      currentStreak: 0,
      longestStreak: 0,
      previousStreak: 0,
      lastStreakDate: null,
      lastOverrideDate: null,
    };

    if (uid) {
      await setStreak(uid, streakData);
    }
    AsyncStorage.removeItem(STREAK_DATA).catch(console.warn);

    return true;
  }

  //Main Streak Effect
  useEffect(() => {
    if (!lastStreakDate) return;
    if (hoursFastedYesterday === null) return;

    const today = formatDayString(new Date(), timeZone);
    const dayStatus = dayQualifier(today, lastStreakDate, timeZone);
    if (dayStatus === "same") return;

    if (dayStatus === "yesterday") {
      // Rest days auto-pass: the user gets streak credit just for opening the app.
      const yesterdayDate = addDaysInTimeZone(Date.now(), -1, timeZone);
      const yesterdayKey = getDayKey(yesterdayDate, timeZone);
      const yesterdayConfig = weeklySchedule
        ? getDayConfig(weeklySchedule, yesterdayKey)
        : null;
      const isRestDay = yesterdayConfig?.type === "rest";

      // Without a goal we can only evaluate rest days
      if (!isRestDay && !fastingGoalHours) return;

      const qualifies =
        isRestDay || fastingQualifier(hoursFastedYesterday, fastingGoalHours);

      if (qualifies) {
        incrementStreak();
      } else {
        breakStreak();
      }
      return;
    }

    if (dayStatus === "missed") {
      // Only break if a schedule goal is set; no schedule = nothing to break
      if (!fastingGoalHours) return;
      breakStreak();
      return;
    }
  }, [
    today,
    lastStreakDate,
    fastingGoalHours,
    hoursFastedYesterday,
    timeZone,
    weeklySchedule,
  ]);

  const value = {
    currentStreak: currentStreak,
    longestStreak: longestStreak,
    lastStreakDate: lastStreakDate,
    previousStreak: previousStreak,
    incrementStreak: incrementStreak,
    breakStreak: breakStreak,
    overrideStreak: overrideStreak,
    canOverrideStreak: canOverrideStreak,
    loadStreak: loadStreak,
    statsLogout: statsLogout,
  };

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
}

export default StatsContextProvider;
