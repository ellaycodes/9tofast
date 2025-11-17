import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import useFastingPersistence from "./useFastingPersistence.js";
import * as session from "./fasting-session";
import * as events from "./events";
import useScheduleBoundaryScheduler from "./scheduler";
import useFastingLoader from "./useFastingLoader";
import useDailyStatsSync from "./useDailyStatsSync";

export const FastingContext = createContext({
  loading: true,
  schedule: null,
  events: [],
  state: null,
  hoursFastedToday: null,
  setSchedule: () => {},
  setBaselineAnchor: () => {},
  startFast: () => {},
  endFast: () => {},
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
  const [state, dispatch] = useReducer(reducer, session.getInitialState());

  const { load, persist, addFastingEvent, addDailyStats, flushDailyEvents } =
    useFastingPersistence();

  useFastingLoader(load, dispatch);

  useDailyStatsSync(state, addDailyStats, flushDailyEvents, persist, dispatch);

  const hours = useMemo(() => session.hoursFastedToday(state), [state]);

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

  function setSchedule(data) {
    dispatch({ type: "SET_SCHEDULE", payload: data });
  }

  function startFast(trigger) {
    const previousEvents = state.events.length
      ? state.events[state.events.length - 1]
      : null;
    const last = previousEvents ? previousEvents.type : undefined;
    if (last === events.EVENT.START) return;
    const ts = Date.now();
    addFastingEvent(ts, events.EVENT.START, trigger);
    dispatch({ type: "START_FAST", trigger, payload: ts });
  }

  function endFast(trigger) {
    const previousEvents = state.events.length
      ? state.events[state.events.length - 1]
      : null;
    const last = previousEvents ? previousEvents.type : undefined;
    if (last === events.EVENT.END) return;
    const ts = Date.now();
    addFastingEvent(ts, events.EVENT.END, trigger);
    dispatch({ type: "END_FAST", trigger, payload: ts });
  }

  function setBaselineAnchor(timestamp) {
    dispatch({ type: "SET_BASELINE_ANCHOR", payload: timestamp });
  }

  function clearFast() {
    dispatch({ type: "CLEAR_ALL" });
  }

  const value = {
    loading: state.loading,
    schedule: state.schedule,
    events: state.events,
    state: state,
    hoursFastedToday: hours,
    setSchedule: setSchedule,
    startFast: startFast,
    endFast: endFast,
    setBaselineAnchor: setBaselineAnchor,
    clearFast: clearFast,
    isFasting: () => isFasting(),
  };

  return (
    <FastingContext.Provider value={value}>{children}</FastingContext.Provider>
  );
}

export const useFasting = () => useContext(FastingContext);
