import { useEffect, useRef } from "react";
import * as dt from "date-fns";
import * as session from "./fasting-session";
import * as events from "./events";

export default function useDailyStatsSync(
  state,
  addDailyStats,
  flushDailyEvents,
  persist,
  dispatch
) {
  const lastSavedDay = useRef();

  useEffect(() => {
    if (state.loading) return;
    const now = new Date();
    const startOfToday = dt.startOfDay(now).getTime();
    const day = dt.format(now, "yyyy-MM-dd");

    if (!lastSavedDay.current) {
      lastSavedDay.current = day;
    } else if (lastSavedDay.current !== day) {
      const prevDayStr = dt.format(startOfToday - 1, "yyyy-MM-dd");
      const prevEvents = state.events.filter((e) => e.ts < startOfToday);
      const hoursPrevDay = session.hoursFastedToday(state, startOfToday - 1);
      const scheduleHours =
        state.schedule && state.schedule.fastingHours != null
          ? state.schedule.fastingHours
          : undefined;
      addDailyStats(prevDayStr, hoursPrevDay, scheduleHours, prevEvents);

      let remaining = state.events.filter((e) => e.ts >= startOfToday);
      if (session.isFasting(prevEvents)) {
        remaining = [
          {
            type: events.EVENT.START,
            ts: startOfToday,
            trigger: events.EVENT.TRIGGER,
          },
          ...remaining,
        ];
      }
      flushDailyEvents(remaining);
      dispatch({ type: "SET_EVENTS", payload: remaining });
      lastSavedDay.current = day;
      return;
    }

    const persistable = { ...state };
    delete persistable.hours;
    persist(persistable);
  }, [state, persist, addDailyStats, flushDailyEvents, dispatch]);
}
