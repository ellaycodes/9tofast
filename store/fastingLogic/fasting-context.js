// /store/fasting-context.js
import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef
} from "react";
import { load, persist } from "./fasting-storage";
import * as session from "./fasting-session";
import * as events from "./events";
import useScheduleBoundaryScheduler from "./scheduler";
import * as dt from "date-fns";
import { addDailyStats } from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";

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

    default:
      return state;
  }
}

export default function FastingContextProvider({ children }) {
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
  }, []);

  const hours = useMemo(() => session.hoursFastedToday(state), [state]);

  useEffect(() => {
    if (state.loading) return;
    const { hours: _unused, ...persistable } = state;
    persist(persistable);
    const day = dt.format(new Date(), "yyyy-MM-dd");
    if (auth.currentUser && lastSavedDay.current !== day) {
      addDailyStats(
        auth.currentUser.uid,
        day,
        hours,
        state.schedule?.fastingHours
      );
      lastSavedDay.current = day;
    }
  }, [state]);

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
    startFast: (trigger) => dispatch({ type: "START_FAST", trigger }),
    endFast: (trigger) => dispatch({ type: "END_FAST", trigger }),
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
