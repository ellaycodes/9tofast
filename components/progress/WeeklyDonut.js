import { useMemo, useRef, useCallback } from "react";
import { Dimensions, FlatList, StyleSheet, View, Text } from "react-native";
import * as dt from "date-fns";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useAppTheme } from "../../store/app-theme-context";
import useWeeklyStats from "../../store/fastingLogic/useWeeklyStats";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CIRCLE_SIZE = Math.floor(SCREEN_WIDTH / 9);
const CIRCLE_WIDTH = Math.max(4, Math.round(CIRCLE_SIZE * 0.25));

// helper to build 7-day array for a given week start
function buildWeekDays(weekStart, statsMap) {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = dt.addDays(weekStart, i);
    const key = dt.format(d, "yyyy-MM-dd");
    return { date: d, percent: statsMap.get(key) ?? 0 };
  });
}

export default function WeeklyDonut({ onWeekChange }) {
  const { theme } = useAppTheme();
  const { weeklyStats, refreshWeeklyStats } = useWeeklyStats();
  const listRef = useRef(null);

  // page index 0 is current week, 1 is previous week, etc
  const pages = useMemo(() => {
    // prebuild 12 weeks including current
    return Array.from({ length: 12 }).map((_, idx) => {
      const start = dt.startOfWeek(dt.subWeeks(new Date(), idx), {
        weekStartsOn: 1,
      });
      const end = dt.endOfWeek(start, { weekStartsOn: 0 });
      return { key: dt.format(start, "yyyy-MM-dd"), start, end };
    });
  }, []);

  // map stats to quick lookup
  const statsMap = useMemo(() => {
    const m = new Map();
    weeklyStats.forEach((s) => m.set(s.day, s.percent ?? 0));
    return m;
  }, [weeklyStats]);

  // load current week on mount
  // FlatList onViewableItemsChanged will lazy load other weeks as you scroll
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!viewableItems?.length) return;
    const first = viewableItems[0]?.item;

    if (!first) return;
    refreshWeeklyStats(first.start, first.end);
    onWeekChange && onWeekChange(first.start, first.end);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90,
  }).current;

  const renderWeek = useCallback(
    ({ item }) => {
      const days = buildWeekDays(item.start, statsMap);

      return (
        <View style={[styles.page, { width: SCREEN_WIDTH * 0.91 }]}>
          <View style={styles.circlesRow}>
            {days.map((day, idx) => (
              <View key={idx} style={[styles.circleWrap]}>
                <View style={styles.weekRow}>
                  <Text
                    key={idx}
                    style={[
                      styles.weekDay,
                      {
                        color: theme.text,
                        backgroundColor: dt.isSameDay(day.date, new Date())
                          ? theme.card
                          : null,
                        paddingVertical: 6,
                        borderRadius: 100,
                      },
                    ]}
                  >
                    {dt.format(day.date, "EEEEEE")}
                  </Text>
                </View>
                <AnimatedCircularProgress
                  size={CIRCLE_SIZE}
                  width={CIRCLE_WIDTH}
                  fill={Math.min(100, Math.max(0, day.percent))}
                  tintColor={theme.success}
                  backgroundColor={theme.secondary100}
                  lineCap="round"
                  rotation={0}
                />
                <Text
                  key={idx}
                  style={[
                    styles.weekDay,
                    {
                      color: theme.muted,
                      paddingVertical: 6,
                    },
                  ]}
                >
                  {dt.format(day.date, "dd")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    },
    [statsMap, theme]
  );

  return (
    <FlatList
      ref={listRef}
      data={pages}
      horizontal
      pagingEnabled
      inverted
      showsHorizontalScrollIndicator={false}
      renderItem={renderWeek}
      keyExtractor={(i) => i.key}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      initialScrollIndex={0}
      getItemLayout={(_, index) => ({
        length: SCREEN_WIDTH,
        offset: SCREEN_WIDTH * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 15,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 6,
  },
  weekDay: {
    textAlign: "center",
    fontSize: 12,
    flex: 1,
  },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  circleWrap: {
    alignItems: "center",
    flex: 1,
  },
});
