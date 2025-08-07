// /store/fasting-context.js
import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { load, persist } from "./fasting-storage";
import * as session from "./fasting-session";
import * as events from "./events";
import useBaselineScheduler from "./scheduler";

export const FastingContext = createContext({
  loading: true,
  schedule: null,
  events: [],
  hoursFastedToday: null,
  setSchedule: () => {},
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
      return events.startFast(state, action.trigger);

    case "END_FAST":
      return events.endFast(state, action.trigger);

    case "CLEAR_ALL":
      return session.clearAll();

    default:
      return state;
  }
}

export default function FastingContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, session.getInitialState());

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

  useEffect(() => {
    if (state.loading) return;
    state.hours = session.hoursFastedToday(state);
    persist(state);
  }, [state]);

  const isFasting = useCallback(
    () => session.isFasting(state.events),
    [state.events]
  );

  useBaselineScheduler(state.schedule, state.events, dispatch);
  
  const value = {
    loading: state.loading,
    schedule: state.schedule,
    events: state.events,
    hoursFastedToday: state.hours,
    setSchedule: (data) => dispatch({ type: "SET_SCHEDULE", payload: data }),
    startFast: (trigger) => dispatch({ type: "START_FAST", trigger }),
    endFast: (trigger) => dispatch({ type: "END_FAST", trigger }),
    clearFast: () => dispatch({ type: "CLEAR_ALL" }),
    isFasting: () => isFasting(),
  };

  return (
    <FastingContext.Provider value={value}>{children}</FastingContext.Provider>
  );
}

export const useFasting = () => useContext(FastingContext);
