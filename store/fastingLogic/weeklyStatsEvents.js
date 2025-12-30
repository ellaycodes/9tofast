const listeners = new Set();

export function emitWeeklyStatsRefresh(payload) {
  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (error) {
      console.warn("[weekly-stats] emitWeeklyStatsRefresh", error);
    }
  });
}

export function subscribeWeeklyStatsRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
