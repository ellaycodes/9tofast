export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Format HH:mm in 24‑hour UK style.
export const fmt = (d) =>
  d.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  });

// Turn milliseconds → "hh:mm:ss"
export const asHms = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
};

// Create Date objects for *today's* start & end window.
export const todayWindow = (schedule) => {
  const now = new Date();

  const start = new Date(schedule.start);
  const end = new Date(schedule.end);

  // pull today’s Y‑M‑D into both dates so they line up with today
  start.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
  end.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

  // If the window spans midnight (end < start), push `end` to tomorrow
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }
  return { start, end };
};
