import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
} from "react";
import useFastingPersistence from "./useFastingPersistence.js";
import * as session from "./fasting-session";
import * as events from "./events";
import useScheduleBoundaryScheduler from "./scheduler";
import * as dt from "date-fns";

export const FastingContext = createContext({
  loading: true,
  schedule: null,
  events: [],
  hoursFastedToday: null,
  setSchedule: () => {},
  setBaselineAnchor: (ts) => {},
  startFast: (trigger) => {},
  endFast: (trigger) => {},
  clearFast: () => {},
  isFasting: false,
});

function reducer(state, action) {
  switch (action.type) {
    case "LOADED":
      return { ...state, loading: false, ...action.payload };

    case "SET_SCHEDULE":
      return session.setSchedule(state, action.payload);

    case "START_FAST":
      return events.startFast(state, action.trigger, action.payload);

    case "END_FAST":
      return events.endFast(state, action.trigger, action.payload);

    case "SET_BASELINE_ANCHOR":
      return { ...state, baselineAnchorTs: action.payload };

    case "CLEAR_ALL":
      return session.clearAll();

    case "SET_EVENTS":
      return { ...state, events: action.payload };

    default:
      return state;
  }
}

export default function FastingContextProvider({ children }) {
  const { load, persist, addFastingEvent, addDailyStats, flushDailyEvents } =
    useFastingPersistence();
  const [state, dispatch] = useReducer(reducer, session.getInitialState());
  const lastSavedDay = useRef();

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await load();
      if (active) dispatch({ type: "LOADED", payload: res });
    })();
    return () => {
      active = false;
    };
  }, [load]);

  const hours = useMemo(() => session.hoursFastedToday(state), [state]);

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
      addDailyStats(
        prevDayStr,
        hoursPrevDay,
        state.schedule?.fastingHours,
        prevEvents
      );

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
    const { hours: _unused, ...persistable } = state;
    persist(persistable);
  }, [state, persist, addDailyStats, flushDailyEvents]);

  const isFasting = useCallback(
    () => session.isFasting(state.events),
    [state.events]
  );

  useScheduleBoundaryScheduler(
    state.schedule,
    state.events,
    dispatch,
    state.baselineAnchorTs || 0
  );

  const value = {
    loading: state.loading,
    schedule: state.schedule,
    events: state.events,
    hoursFastedToday: hours,
    setSchedule: (data) => dispatch({ type: "SET_SCHEDULE", payload: data }),
    startFast: (trigger) => {
      const last = state.events.at(-1)?.type;
      if (last === events.EVENT.START) return;
      const ts = Date.now();
      addFastingEvent(ts, events.EVENT.START, trigger);
      dispatch({ type: "START_FAST", trigger, payload: ts });
    },
    endFast: (trigger) => {
      const last = state.events.at(-1)?.type;
      if (last === events.EVENT.END) return;
      const ts = Date.now();
      addFastingEvent(ts, events.EVENT.END, trigger);
      dispatch({ type: "END_FAST", trigger, payload: ts });
    },
    setBaselineAnchor: (ts) =>
      dispatch({ type: "SET_BASELINE_ANCHOR", payload: ts }),
    clearFast: () => dispatch({ type: "CLEAR_ALL" }),
    isFasting: () => isFasting(),
  };

  return (
    <FastingContext.Provider value={value}>{children}</FastingContext.Provider>
  );
}

export const useFasting = () => useContext(FastingContext);
