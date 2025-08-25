import { auth } from "../../firebase/app";
import { addFastingEvent } from "../../firebase/fasting.db.js";
import * as dt from "date-fns";

export const EVENT = Object.freeze({
  START: "start",
  END: "end",
  TRIGGER: "auto",
});

export const addEvent = (state, type, ts = Date.now(), trigger) => {
  const last = state.events.at(-1)?.type;

  if (type === EVENT.START && last === EVENT.START) return state;
  if (type === EVENT.END && last === EVENT.END) return state;
  addFastingEvent(
    auth.currentUser.uid,
    ts,
    type,
    dt.format(new Date(ts), "yyyy-MM-dd"),
    trigger,
  );
  return { ...state, events: [...state.events, { type, ts, trigger }] };
};

export const startFast = (s, tr, t) => addEvent(s, EVENT.START, t, tr);
export const endFast = (s, tr, t) => addEvent(s, EVENT.END, t, tr);
