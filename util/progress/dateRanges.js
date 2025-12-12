import * as dt from "date-fns";

export function getWeekRange(date) {
  const start = dt.startOfWeek(date, { weekStartsOn: 1 });
  const end = dt.endOfWeek(start, { weekStartsOn: 1 });
  return { start, end };
}

export function buildWeekPages(count, baseDate = new Date()) {
  return Array.from({ length: count }).map((_, idx) => {
    const { start, end } = getWeekRange(dt.subWeeks(baseDate, idx));
    return { key: dt.format(start, "yyyy-MM-dd"), start, end };
  });
}

export function buildRecentWeekRanges(count) {
  return Array.from({ length: count }).map((_, i) => getWeekRange(dt.subWeeks(new Date(), i)));
}