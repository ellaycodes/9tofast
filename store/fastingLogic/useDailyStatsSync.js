import { useEffect, useRef } from "react";
import * as session from "./fasting-session";
import * as events from "./events";
import {
  addDaysInTimeZone,
  formatDayString,
  getScheduleTimeZone,
  startOfDayTs,
} from "../../util/timezone";

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
  uploadDailyStats, // Function to send yesterday’s stats to Firebase (locked)
  saveDailyEvents, // Function to overwrite local AsyncStorage events
  saveLocalState, // Function to persist the full fasting state locally
  dispatch // Redux-style dispatcher for in-memory updates
) {
  // Keeps track of the last day that was processed
  const lastProcessedDay = useRef();
  const lastSavedHash = useRef(null);
  const latestStateRef = useRef(fastingState);

  useEffect(() => {
    latestStateRef.current = fastingState;
  }, [fastingState]);

  const deriveLastEventDay = (eventsList, fallbackDay, timeZone) => {
    if (!eventsList?.length) return fallbackDay;
    const latestEvent = eventsList[eventsList.length - 1];
    return formatDayString(latestEvent.ts, timeZone);
  };

  useEffect(() => {
    if (fastingState.loading) return; // Skip until data is loaded

    const now = new Date();
    const timeZone = getScheduleTimeZone(fastingState.schedule);
    const startOfToday = startOfDayTs(now, timeZone);
    const currentDayString = formatDayString(now, timeZone);

    if (!lastProcessedDay.current) {
      lastProcessedDay.current = deriveLastEventDay(
        fastingState.events,
        currentDayString,
        timeZone
      );
    }

    // // --- 2️⃣ Handle midnight rollover (when a new day starts)
    const hasEventsBeforeToday = (fastingState.events || []).some((event) => {
      const ts = event?.ts ?? 0;
      return ts < startOfToday;
    });
    const newDayStarted =
      hasEventsBeforeToday || lastProcessedDay.current !== currentDayString;

    (async () => {
      if (newDayStarted) {
        const previousDayDate = addDaysInTimeZone(startOfToday, -1, timeZone);
        const previousDayString = formatDayString(previousDayDate, timeZone);
        const previousDayStart = startOfDayTs(previousDayDate, timeZone);
        const yesterdayEvents = (fastingState.events || []).filter(
          (event) => (event?.ts ?? 0) < startOfToday
        );

        // Calculate how long the user fasted yesterday
        const hoursFastedYesterday = session.hoursFastedToday(
          fastingState,
          startOfToday - 1
        );

        // Get scheduled fasting goal for that day
        const scheduledHours = fastingState.schedule?.fastingHours ?? undefined;

        // Upload previous day’s fasting stats to Firebase
        await uploadDailyStats(
          previousDayString,
          hoursFastedYesterday,
          scheduledHours,
          yesterdayEvents,
          { timeZone, dayStartUtc: previousDayStart },
          { skipIfUploaded: true }
        );

        // --- 3️⃣ Build new day’s event list
        // Keep only today’s events (starting from midnight)
        let todaysEvents = (fastingState.events || []).filter(
          (event) => (event?.ts ?? 0) >= startOfToday
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
        await saveDailyEvents(todaysEvents);
        dispatch({ type: "SET_EVENTS", payload: todaysEvents });

        // Update tracker to prevent re-processing the same day
        const stateToSave = { ...fastingState, events: todaysEvents };
        delete stateToSave.hours;
        await saveLocalState(stateToSave);
        lastSavedHash.current = JSON.stringify(stateToSave);

        lastProcessedDay.current = currentDayString;
        return;
      }

      // --- 5️⃣ During the same day, persist fasting state periodically
      // const stateToSave = { ...fastingState };
      // delete stateToSave.hours; // 'hours' can always be recalculated
      // await saveLocalState(stateToSave);
    })();
  }, [
    fastingState,
    saveLocalState,
    uploadDailyStats,
    saveDailyEvents,
    dispatch,
  ]);

  useEffect(() => {
    if (fastingState.loading) return;

    let isMounted = true;
    const persist = async () => {
      if (!isMounted) return;
      const stateToSave = { ...latestStateRef.current };
      delete stateToSave.hours; // 'hours' can always be recalculated
      const serialized = JSON.stringify(stateToSave);
      if (lastSavedHash.current === serialized) return;
      await saveLocalState(stateToSave);
      lastSavedHash.current = serialized;
    };

    persist();
    const intervalId = setInterval(persist, 30_000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fastingState.loading, saveLocalState]);
}
