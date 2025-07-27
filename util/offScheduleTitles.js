const OFF_SCHEDULE_EATING = [
  "Snack Attack Zone",
  "Rebel Bite Time",
  "Munchies O'Clock",
  "Unauthorized Feast",
  "Freestyle Fueling",
  "Mid-Fast Fiesta",
  "Impulsive Snackathon",
  "Culinary Coup"
];

const FAST_DURING_EATING = [
  "Feast Denied",
  "Hangry Hangout",
  "Willpower Wonderland",
  "Starvation Station",
  "Snack Sabotage",
  "Dietarian Duty",
  "Rebel Fast Club",
  "No-Bite Brigade"
];

/**
 * Get a random off‑schedule title.
 *
 * @param {"eating"|"fasting"} mode
 *   - "eating": user is eating outside their fast
 *   - "fasting": user is fasting during an eating window
 * @returns {string}
 */
export function getRandomOffScheduleTitle(mode) {
  const pool =
    mode === "fasting"
      ? FAST_DURING_EATING
      : OFF_SCHEDULE_EATING;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}