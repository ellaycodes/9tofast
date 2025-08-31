import { useMemo, useRef } from "react";
import { Dimensions, FlatList, StyleSheet, View, Text } from "react-native";
import * as dt from "date-fns";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useAppTheme } from "../../store/app-theme-context";
import useWeeklyStats from "../../store/fastingLogic/useWeeklyStats";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// helper to build 7-day array for a given week start
function buildWeekDays(weekStart, statsMap) {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = dt.addDays(weekStart, i);
    const key = dt.format(d, "yyyy-MM-dd");
    return { date: d, percent: statsMap.get(key) ?? 0 };
  });
}

export default function WeeklyDonut() {
  const { theme } = useAppTheme();
  const { weeklyStats, refreshWeeklyStats } = useWeeklyStats();
  const listRef = useRef(null);

  // page index 0 is current week, 1 is previous week, etc
  const pages = useMemo(() => {
    // prebuild 26 weeks including current
    return Array.from({ length: 26 }).map((_, idx) => {
      const start = dt.startOfWeek(dt.subWeeks(new Date(), idx), {
        weekStartsOn: 0,
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
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 100 }).current;

  const renderWeek = ({ item }) => {
    const days = buildWeekDays(item.start, statsMap);
    return (
      <View style={[styles.page, { width: SCREEN_WIDTH}]}>
        <View style={styles.weekRow}>
          {"SMTWTFS".split("").map((d, i) => (
            <Text
              key={d + i}
              style={[
                styles.weekDay,
                { color: theme.muted, width: `${100 / 7}%` },
              ]}
            >
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.circlesRow}>
          {days.map((day, idx) => (
            <View key={idx} style={styles.circleWrap}>
              <AnimatedCircularProgress
                size={50}
                width={10}
                fill={Math.min(100, Math.max(0, day.percent))}
                tintColor={theme.success}
                backgroundColor={theme.secondary100}
                lineCap="round"
                rotation={0}
              />
            </View>
          ))}
        </View>

        <Text style={[styles.weekLabel, { color: theme.text }]}>
          {dt.format(item.start, "d MMM")} to {dt.format(item.end, "d MMM")}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      ref={listRef}
      data={pages}
      horizontal
      pagingEnabled
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
    // paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  weekDay: {
    textAlign: "center",
    fontSize: 12,
  },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  circleWrap: {
    width: `${100 / 7}%`,
    alignItems: "center",
  },
  weekLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
  },
});
