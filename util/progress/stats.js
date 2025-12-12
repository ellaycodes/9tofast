export function buildStatsMap(weeklyStats) {
  const statsMap = new Map();
  weeklyStats.forEach((stat) => {
    statsMap.set(stat.day, stat);
  });
  return statsMap;
}

export function buildDayLookupValue(stat) {
  return {
    percent: stat?.percent ?? 0,
    hoursFastedToday: stat?.hoursFastedToday ?? 0,
    events: stat?.events ?? [],
  };
}