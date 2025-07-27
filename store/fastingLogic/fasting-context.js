// /store/fasting-context.js
import { createContext, useEffect, useContext, useReducer } from "react";
import { load, persist } from "./fasting-storage";
import * as session from "./fasting-session";

export const FastingContext = createContext({
  loading: true,
  schedule: null,
  fastStartTime: null,
  hoursFastedToday: null,
  setSchedule: () => {},
  startFast: () => {},
  clearFast: () => {},
});

function reducer(state, action) {
  switch (action.type) {
    case "LOADED":
      return { ...state, loading: false, ...action.payload };

    case "SET_SCHEDULE":
      return session.setSchedule(state, action.payload);

    case "START_FAST":
      return session.startFast(state);

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

  console.log('context', state);

  useEffect(() => {
    if (state.loading) return;
    persist({ schedule: state.schedule, fastStartTime: state.fastStartTime });
  }, [state.schedule, state.fastStartTime, state.loading]);

  const value = {
    loading: state.loading,
    schedule: state.schedule,
    fastStartTime: state.fastStartTime,
    setSchedule: (data) => dispatch({ type: "SET_SCHEDULE", payload: data }),
    startFast: () => dispatch({ type: "START_FAST" }),
    clearFast: () => dispatch({ type: "CLEAR_ALL" }),
  };

  return (
    <FastingContext.Provider value={value}>{children}</FastingContext.Provider>
  );
}

export const useFasting = () => useContext(FastingContext);
