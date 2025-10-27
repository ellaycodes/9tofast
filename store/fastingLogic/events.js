export const EVENT = Object.freeze({
  START: "start",
  END: "end",
  TRIGGER: "auto",
});

export const addEvent = (state, type, ts = Date.now(), trigger) => {
  const previous = state.events.length
    ? state.events[state.events.length - 1]
    : null;
  const last = previous ? previous.type : undefined;

  if (type === EVENT.START && last === EVENT.START) return state;
  if (type === EVENT.END && last === EVENT.END) return state;
  return { ...state, events: [...state.events, { type, ts, trigger }] };
};

export const startFast = (s, tr, t) => addEvent(s, EVENT.START, t, tr);
export const endFast = (s, tr, t) => addEvent(s, EVENT.END, t, tr);
