import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import useFastingPersistence, {
  getStateStorageKey,
  getWeeklyStorageKey,
} from "./useFastingPersistence.js";
import * as session from "./fasting-session";
import * as events from "./events";
import useScheduleBoundaryScheduler from "./scheduler";
import useFastingLoader from "./useFastingLoader";
import useDailyStatsSync from "./useDailyStatsSync";
import { emitWeeklyStatsRefresh } from "./weeklyStatsEvents";
import { getResolvedTimeZone } from "../../util/timezone";
import { auth } from "../../firebase/app";
import {
  setFastingStateDb,
  setFastingScheduleDb,
} from "../../firebase/fasting.db.js";
import {
  buildWeeklyScheduleFromLegacy,
  flatScheduleFromWeekly,
  isWeeklySchedule,
} from "./data/weekly-schedule.js";

export const FastingContext = createContext({
  loading: true,
  schedule: null,
  weeklySchedule: null,
  events: [],
  state: null,
  hoursFastedToday: null,
  setSchedule: async () => {},
  startFast: async () => {},
  endFast: async () => {},
  clearFast: () => {},
  isFasting: false,
});

function reducer(state, action) {
  switch (action.type) {
    case "LOADED":
      return { ...state, loading: false, ...action.payload };

    case "SET_SCHEDULE":
      return session.setSchedule(state, action.payload);

    case "SET_WEEKLY_SCHEDULE":
      return { ...state, weeklySchedule: action.payload };

    case "START_FAST":
      return events.startFast(state, action.trigger, action.payload);

    case "END_FAST":
      return events.endFast(state, action.trigger, action.payload);

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

  const { load, uploadDailyStats } = useFastingPersistence();

  useFastingLoader(load, dispatch);

  // Keep stateRef current for use in callbacks without creating stale closures
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // --- Auto-save: write fasting state (schedule + events) on every meaningful change ---
  useEffect(() => {
    if (state.loading) return;
    const uid = auth.currentUser?.uid || null;
    const toSave = { schedule: state.schedule, events: state.events };

    if (uid) {
      setFastingStateDb(uid, toSave).catch((e) =>
        console.warn("[fasting] save state failed", e)
      );
    }
    AsyncStorage.setItem(
      getStateStorageKey(uid),
      JSON.stringify(toSave)
    ).catch(console.warn);
  }, [state.events, state.schedule]);

  // --- Auto-save: persist WeeklySchedule to AsyncStorage + Firestore when it changes ---
  // This also covers the initial migration write: after LOADED sets weeklySchedule
  // for the first time, this effect fires and persists it to Firestore without
  // blocking startup.
  useEffect(() => {
    if (state.loading || !state.weeklySchedule) return;
    const uid = auth.currentUser?.uid || null;
    AsyncStorage.setItem(
      getWeeklyStorageKey(uid),
      JSON.stringify(state.weeklySchedule)
    ).catch(console.warn);
    if (uid) {
      setFastingScheduleDb(uid, state.weeklySchedule).catch((e) =>
        console.warn("[fasting] weekly schedule save failed", e)
      );
    }
  }, [state.weeklySchedule]);

  // --- Daily stats snapshot helpers ---
  const uploadCurrentDaySnapshot = useCallback(
    async (overrideState) => {
      if (!auth.currentUser) return;
      const s = overrideState || stateRef.current;
      const snapshot = session.buildCurrentDayStats(s);
      try {
        await uploadDailyStats(
          snapshot.day,
          snapshot.hoursFasted,
          snapshot.scheduleHours,
          snapshot.events,
          { timeZone: snapshot.timeZone, dayStartUtc: snapshot.dayStartUtc }
        );
        emitWeeklyStatsRefresh();
      } catch (e) {
        console.warn("[fasting] snapshot upload failed", e);
      }
    },
    [uploadDailyStats]
  );

  // Upload snapshot on app background and on foreground return
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background" || next === "inactive" || next === "active") {
        uploadCurrentDaySnapshot();
      }
    });
    return () => sub.remove();
  }, [uploadCurrentDaySnapshot]);

  // One-time snapshot once loading completes
  const initialSnapshotDoneRef = useRef(false);
  useEffect(() => {
    if (!state.loading && !initialSnapshotDoneRef.current) {
      initialSnapshotDoneRef.current = true;
      uploadCurrentDaySnapshot();
    }
  }, [state.loading, uploadCurrentDaySnapshot]);

  // --- Midnight rollover ---
  useDailyStatsSync(state, uploadDailyStats, dispatch);

  // --- Computed values ---
  const hours = useMemo(() => session.hoursFastedToday(state), [state]);

  const isFasting = useCallback(
    () => session.isFasting(state.events),
    [state.events]
  );

  // --- Event dispatchers ---
  const dispatchEvent = useCallback(
    async (ts, type, trigger, options = {}) => {
      const last = stateRef.current.events.slice(-1)[0];
      if (!options.allowDuplicateType && last?.type === type) return;

      dispatch({
        type: type === events.EVENT.START ? "START_FAST" : "END_FAST",
        trigger,
        payload: ts,
      });
    },
    []
  );

  useScheduleBoundaryScheduler(
    state.schedule,
    state.events,
    dispatch,
    dispatchEvent
  );

  // --- Public API ---

  /**
   * Accepts either a legacy flat schedule object or a WeeklySchedule.
   * Always normalises to both representations before persisting.
   */
  async function setSchedule(data) {
    if (!data) {
      dispatch({ type: "SET_SCHEDULE", payload: null });
      dispatch({ type: "SET_WEEKLY_SCHEDULE", payload: null });
      return;
    }

    let flatSchedule, weeklySchedule;

    if (isWeeklySchedule(data)) {
      weeklySchedule = data;
      flatSchedule = flatScheduleFromWeekly(data);
      if (flatSchedule && !flatSchedule.timeZone) {
        flatSchedule = { ...flatSchedule, timeZone: getResolvedTimeZone() };
      }
    } else {
      flatSchedule = data.timeZone
        ? data
        : { ...data, timeZone: getResolvedTimeZone() };
      weeklySchedule = buildWeeklyScheduleFromLegacy(flatSchedule);
    }

    dispatch({ type: "SET_SCHEDULE", payload: flatSchedule });
    dispatch({ type: "SET_WEEKLY_SCHEDULE", payload: weeklySchedule });
    // Firestore + AsyncStorage persistence is handled by the auto-save effect above.
  }

  async function startFast(trigger) {
    const ts = Date.now();
    await dispatchEvent(ts, events.EVENT.START, trigger);
    uploadCurrentDaySnapshot();
  }

  async function endFast(trigger) {
    const ts = Date.now();
    await dispatchEvent(ts, events.EVENT.END, trigger);
    uploadCurrentDaySnapshot();
  }

  function clearFast() {
    dispatch({ type: "CLEAR_ALL" });
  }

  const value = {
    loading: state.loading,
    schedule: state.schedule,
    weeklySchedule: state.weeklySchedule,
    events: state.events,
    state: state,
    hoursFastedToday: hours,
    setSchedule,
    startFast,
    endFast,
    clearFast,
    isFasting: () => isFasting(),
  };

  return (
    <FastingContext.Provider value={value}>{children}</FastingContext.Provider>
  );
}

export const useFasting = () => useContext(FastingContext);
