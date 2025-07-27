// /store/fasting-context.js
import { createContext, useEffect, useContext, useReducer } from "react";
import { load, persist } from "./fasting-storage";
import * as session from "./fasting-session";

export const FastingContext = createContext({
  loading: true,
  schedule: null,
  events: [],
  hoursFastedToday: null,
  setSchedule: () => {},
  startFast: () => {},
  endFast: () => {},
  clearFast: () => {},
});

function reducer(state, action) {
  switch (action.type) {
    case "LOADED":
      return { ...state, loading: false, ...action.payload };

    case "SET_SCHEDULE":
      return session.setSchedule(state, action.payload);

    case "START_FAST":
      console.log("🤜 START_FAST reducer, previous events:", state.events);
      return session.startFast(state);

    case "END_FAST":
      return session.endFast(state);

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
  }, [state.schedule, state.events, state.loading]);

  const value = {
    loading: state.loading,
    schedule: state.schedule,
    events: state.events,
    hoursFastedToday: state.hours,
    setSchedule: (data) => dispatch({ type: "SET_SCHEDULE", payload: data }),
    startFast: () => dispatch({ type: "START_FAST" }),
    endFast: () => dispatch({ type: "END_FAST" }),
    clearFast: () => dispatch({ type: "CLEAR_ALL" }),
  };


  console.log(
    "\n\ncontext value:\n\n",
    JSON.stringify(value, null, 2),
    "\n\nstate:\n\n",
    JSON.stringify(state, null, 2)
  );

  return (
    <FastingContext.Provider value={value}>{children}</FastingContext.Provider>
  );
}

export const useFasting = () => useContext(FastingContext);
