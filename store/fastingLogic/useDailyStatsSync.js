import { useEffect, useRef } from "react";
import * as date from "date-fns";
import * as session from "./fasting-session";
import * as events from "./events";

/**
 * Synchronizes daily fasting data.
 * Handles:
 *  - Detecting new days (midnight rollover)
 *  - Uploading previous day’s fasting stats
 *  - Carrying over ongoing fasts into the new day
 *  - Regularly persisting the current fasting state
 */
export default function useDailyStatsSync(
  fastingState, // Current fasting state from your app
  uploadDailyStats, // Function to send yesterday’s stats to Firebase
  saveDailyEvents, // Function to overwrite local AsyncStorage events
  saveLocalState, // Function to persist the full fasting state locally
  dispatch // Redux-style dispatcher for in-memory updates
) {
  // Keeps track of the last day that was processed
  const lastProcessedDay = useRef();

  useEffect(() => {
    if (fastingState.loading) return; // Skip until data is loaded

    // Get the current time and day details
    const now = new Date();
    const startOfToday = date.startOfDay(now).getTime();
    const currentDayString = date.format(now, "yyyy-MM-dd");

    // --- 1️⃣ Initialize tracking on first run
    if (!lastProcessedDay.current) {
      lastProcessedDay.current = currentDayString;
      return;
    }

    // --- 2️⃣ Handle midnight rollover (when a new day starts)
    const newDayStarted = lastProcessedDay.current !== currentDayString;

    if (newDayStarted) {
      // Prepare previous day’s data
      const previousDayString = date.format(startOfToday - 1, "yyyy-MM-dd");
      const yesterdayEvents = fastingState.events.filter(
        (event) => event.ts < startOfToday
      );

      // Calculate how long the user fasted yesterday
      const hoursFastedYesterday = session.hoursFastedToday(
        fastingState,
        startOfToday - 1
      );

      // Get scheduled fasting goal for that day
      const scheduledHours = fastingState.schedule?.fastingHours ?? undefined;

      // Upload previous day’s fasting stats to Firebase
      uploadDailyStats(
        previousDayString,
        hoursFastedYesterday,
        scheduledHours,
        yesterdayEvents
      );

      // --- 3️⃣ Build new day’s event list
      // Keep only today’s events (starting from midnight)
      let todaysEvents = fastingState.events.filter(
        (event) => event.ts >= startOfToday
      );

      // If the user was still fasting at midnight, insert a “START” event at midnight
      const wasFastingOvernight = session.isFasting(yesterdayEvents);
      if (wasFastingOvernight) {
        const midnightStartEvent = {
          type: events.EVENT.START,
          ts: startOfToday,
          trigger: events.EVENT.TRIGGER,
        };
        todaysEvents = [midnightStartEvent, ...todaysEvents];
      }

      // --- 4️⃣ Save the cleaned event list
      saveDailyEvents(todaysEvents);
      dispatch({ type: "SET_EVENTS", payload: todaysEvents });

      // Update tracker to prevent re-processing the same day
      lastProcessedDay.current = currentDayString;
      return;
    }

    // --- 5️⃣ During the same day, persist fasting state periodically
    const stateToSave = { ...fastingState };
    delete stateToSave.hours; // 'hours' can always be recalculated
    saveLocalState(stateToSave);
  }, [
    fastingState,
    saveLocalState,
    uploadDailyStats,
    saveDailyEvents,
    dispatch,
  ]);
}
