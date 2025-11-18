import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { AppState } from "react-native";
import useFastingPersistence from "./useFastingPersistence.js";
import * as session from "./fasting-session";
import * as events from "./events";
import useScheduleBoundaryScheduler from "./scheduler";
import useFastingLoader from "./useFastingLoader";
import useDailyStatsSync from "./useDailyStatsSync";
import { buildCurrentDayStats } from "./useFastingPersistence.js";

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
  const stateRef = useRef(state);
  const uploadLock = useRef(false);
  const { load, persist, addFastingEvent, addDailyStats, flushDailyEvents } =
    useFastingPersistence();

  useFastingLoader(load, dispatch);

  useDailyStatsSync(state, addDailyStats, flushDailyEvents, persist, dispatch);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const uploadCurrentDaySnapshot = useCallback(
    async (overrideState) => {
      if (uploadLock.current) return;
      uploadLock.current = true;
      try {
        const baseState = overrideState || stateRef.current;
        const snapshot = buildCurrentDayStats(baseState);
        await addDailyStats(
          snapshot.day,
          snapshot.hoursFasted,
          snapshot.scheduleHours,
          snapshot.events
        );
      } finally {
        uploadLock.current = false;
      }
    },
    [addDailyStats]
  );

  useEffect(() => {
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    const handleAppStateChange = async (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        await uploadCurrentDaySnapshot();
      }
      if (nextState === "active") {
        // Optional: also sync on returning to foreground
        await uploadCurrentDaySnapshot();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);

    const intervalId = setInterval(() => {
      uploadCurrentDaySnapshot().catch((err) => {
        // optional: log silently
        console.warn("[fasting-sync] 3hr snapshot failed", err);
      });
    }, THREE_HOURS_MS);

    return () => {
      clearInterval(intervalId);
      sub.remove();
    };
  }, [uploadCurrentDaySnapshot]);

  // One time snapshot once loading completes
  const initialSnapshotTakenRef = useRef(false);
  useEffect(() => {
    if (!state.loading && !initialSnapshotTakenRef.current) {
      initialSnapshotTakenRef.current = true;
      uploadCurrentDaySnapshot().catch((err) => {
        console.warn("[fasting-sync] initial snapshot failed", err);
      });
    }
  }, [state.loading, uploadCurrentDaySnapshot]);

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

  async function startFast(trigger) {
    const previousEvents = state.events.length
      ? state.events[state.events.length - 1]
      : null;
    const last = previousEvents ? previousEvents.type : undefined;
    if (last === events.EVENT.START) return;
    const ts = Date.now();

    await addFastingEvent(ts, events.EVENT.START, trigger);

    const tempState = events.startFast(stateRef.current, trigger, ts);
    dispatch({ type: "START_FAST", trigger, payload: ts });
    
    await uploadCurrentDaySnapshot(tempState);
  }

  async function endFast(trigger) {
    const previousEvents = state.events.length
      ? state.events[state.events.length - 1]
      : null;
    const last = previousEvents ? previousEvents.type : undefined;
    if (last === events.EVENT.END) return;
    const ts = Date.now();

    await addFastingEvent(ts, events.EVENT.END, trigger);

    const tempState = events.startFast(stateRef.current, trigger, ts);
    dispatch({ type: "END_FAST", trigger, payload: ts });

    await uploadCurrentDaySnapshot(tempState);
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
