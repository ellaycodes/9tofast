import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { createContext, useState, useEffect } from "react";
import { setStreak } from "../../firebase/stats.db.js";
import { auth } from "../../firebase/app.js";
import { dayQualifier, fastingQualifier } from "./qualifier.js";
import { useFasting } from "../fastingLogic/fasting-context.js";
import { yesterdayHoursFasted } from "./yesterdayHours.js";

export const StatsContext = createContext({
  currentStreak: 0,
  longestStreak: 0,
  previousStreak: 0,
  lastStreakDate: null,
  incrementStreak: () => {},
  breakStreak: () => {},
  overrideStreak: () => {},
  canOverrideStreak: () => {},
});

function StatsContextProvider({ children }) {
  const { schedule } = useFasting();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastStreakDate, setLastStreakDate] = useState(null);
  const [lastOverrideDate, setLastOverrideDate] = useState(null);
  const [hoursFastedYesterday, setHoursFastedYesterday] = useState(null);

  const oneDay = 24 * 60 * 60 * 1000;
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(new Date(Date.now() - oneDay), "yyyy-MM-dd");
  const fastingGoalHours = schedule?.fastingHours;

  const STREAK_DATA = "streak_data";

  //Load Data on app open
  useEffect(() => {
    async function loadStreak() {
      if (!auth.currentUser) return;

      const raw = await AsyncStorage.getItem(STREAK_DATA);
      if (!raw) return;

      const data = JSON.parse(raw);

      setCurrentStreak(data.currentStreak ?? 0);
      setLongestStreak(data.longestStreak ?? 0);
      setPreviousStreak(data.previousStreak ?? 0);
      setLastStreakDate(data.lastStreakDate ?? null);
      setLastOverrideDate(data.lastOverrideDate ?? null);
    }

    async function yesterdayHoursFromDb() {
      const yesterdayData = await yesterdayHoursFasted();
      setHoursFastedYesterday(yesterdayData);
    }

    yesterdayHoursFromDb();

    loadStreak();
  }, [auth.currentUser]);

  async function save(streakData) {
    await AsyncStorage.setItem(STREAK_DATA, JSON.stringify(streakData));
    if (auth.currentUser) {
      await setStreak(auth.currentUser.uid, streakData);
    }
  }

  async function incrementStreak() {
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
    if (!lastOverrideDate) return true;
    const last = new Date(lastOverrideDate);
    const now = new Date(today);
    const diffInDays = Math.floor((now - last) / oneDay);
    const canOverride = diffInDays >= cooldownDays;
    return { canOverride, diffInDays};
  }

  //Main Streak Effect
  useEffect(() => {
    if (!lastStreakDate) return;
    if (hoursFastedYesterday === null) return;
    if (!fastingGoalHours) return;

    const dayStatus = dayQualifier(today, lastStreakDate);
    if (dayStatus === "same") return;

    if (dayStatus === "yesterday") {
      const qualifies = fastingQualifier(
        hoursFastedYesterday,
        fastingGoalHours
      );

      if (qualifies) {
        incrementStreak();
      } else {
        breakStreak();
      }
      return;
    }

    if (dayStatus === "missed") {
      breakStreak();
      return;
    }
  }, [today, lastStreakDate, fastingGoalHours, hoursFastedYesterday]);

  const value = {
    currentStreak: currentStreak,
    longestStreak: longestStreak,
    lastStreakDate: lastStreakDate,
    previousStreak: previousStreak,
    incrementStreak: incrementStreak,
    breakStreak: breakStreak,
    overrideStreak: overrideStreak,
    canOverrideStreak: canOverrideStreak,
  };

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
}

export default StatsContextProvider;
