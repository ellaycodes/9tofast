import { useEffect, useRef } from "react";
import * as session from "./fasting-session";
import { EVENT } from "./events";
import {
  addDaysInTimeZone,
  formatDayString,
  getScheduleTimeZone,
  startOfDayTs,
} from "../../util/timezone";

/**
 * Detects midnight rollovers, uploads the previous day's fasting stats,
 * and carries overnight fasts into the new day.
 *
 * Parameters
 *   fastingState       – live state from the reducer
 *   uploadDailyStats   – (day, hours, scheduledHours, events, meta) → Promise
 *   dispatch           – reducer dispatch
 */
export default function useDailyStatsSync(
  fastingState,
  uploadDailyStats,
  dispatch
) {
  const lastProcessedDay = useRef();

  useEffect(() => {
    if (fastingState.loading) return;

    const now = new Date();
    const timeZone = getScheduleTimeZone(fastingState.schedule);
    const startOfToday = startOfDayTs(now, timeZone);
    const currentDayString = formatDayString(now, timeZone);

    // --- Seed lastProcessedDay on first run ---
    if (!lastProcessedDay.current) {
      const hasOldEvents = (fastingState.events || []).some(
        (e) => (e?.ts ?? 0) < startOfToday
      );
      if (hasOldEvents) {
        // Events from a previous day exist → trigger rollover once
        lastProcessedDay.current = formatDayString(
          addDaysInTimeZone(new Date(startOfToday), -1, timeZone),
          timeZone
        );
      } else {
        lastProcessedDay.current = currentDayString;
      }
    }

    // Rollover fires exactly once when the calendar day changes.
    // Guard is set before async work so a re-render mid-rollover doesn't
    // re-trigger the effect and launch a second concurrent Firestore write.
    if (lastProcessedDay.current === currentDayString) return;
    lastProcessedDay.current = currentDayString;

    (async () => {
      const previousDayDate = addDaysInTimeZone(
        new Date(startOfToday),
        -1,
        timeZone
      );
      const previousDayString = formatDayString(previousDayDate, timeZone);
      const previousDayStart = startOfDayTs(previousDayDate, timeZone);

      // Calculate hours fasted yesterday (last ms of yesterday as "now")
      const hoursFastedYesterday = session.hoursFastedToday(
        fastingState,
        startOfToday - 1
      );

      const scheduledHours = fastingState.schedule?.fastingHours ?? undefined;

      const yesterdayEvents = (fastingState.events || []).filter(
        (e) => (e?.ts ?? 0) < startOfToday
      );

      // Upload the previous day's summary
      await uploadDailyStats(
        previousDayString,
        hoursFastedYesterday,
        scheduledHours,
        yesterdayEvents,
        { timeZone, dayStartUtc: previousDayStart }
      ).catch((e) => console.warn("[daily-sync] upload failed", e));

      // Build today's starting events
      let todaysEvents = (fastingState.events || []).filter(
        (e) => (e?.ts ?? 0) >= startOfToday
      );

      // If the user was fasting at midnight, insert an explicit START at midnight
      const wasFastingOvernight = session.isFasting(yesterdayEvents);
      const hasMidnightStart = todaysEvents.some(
        (e) => e?.ts === startOfToday && e?.type === EVENT.START
      );

      if (wasFastingOvernight && !hasMidnightStart) {
        todaysEvents = [
          { type: EVENT.START, ts: startOfToday, trigger: "auto" },
          ...todaysEvents,
        ];
      }

      dispatch({ type: "SET_EVENTS", payload: todaysEvents });
    })();
  }, [fastingState, uploadDailyStats, dispatch]);
}
