import { useMemo, useRef, useCallback, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  Text,
  Pressable,
} from "react-native";
import * as dt from "date-fns";
import { AnimatedCircularProgress } from "react-native-circular-progress";

import { useAppTheme } from "../../store/app-theme-context";
import { buildWeekPages } from "../../util/progress/dateRanges";
import { buildDayLookupValue, buildStatsMap } from "../../util/progress/stats";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CIRCLE_SIZE = Math.floor(SCREEN_WIDTH / 9);
const CIRCLE_WIDTH = Math.max(4, Math.round(CIRCLE_SIZE * 0.25));

// helper to build 7-day array for a given week start
function buildWeekDays(weekStart, statsMap) {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = dt.addDays(weekStart, i);
    const key = dt.format(date, "yyyy-MM-dd");
    const data = buildDayLookupValue(statsMap.get(key));
    return { date, ...data };
  });
}

export default function WeeklyDonut({
  onWeekChange,
  onDaySelect,
  weeklyStats,
  refreshWeeklyStats,
  selectedDay,
}) {
  const { theme } = useAppTheme();
  const listRef = useRef(null);

  // page index 0 is current week, 1 is previous week, etc
  const pages = useMemo(() => buildWeekPages(12), []);

  // map stats to quick lookup
  const statsMap = useMemo(() => buildStatsMap(weeklyStats), [weeklyStats]);

  // load current week on mount
  // FlatList onViewableItemsChanged will lazy load other weeks as you scroll
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!viewableItems || !viewableItems.length) return;
    const firstItem = viewableItems[0];
    const first = firstItem ? firstItem.item : undefined;

    if (!first) return;
    refreshWeeklyStats(first.start, first.end);
    onWeekChange && onWeekChange(first.start, first.end);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useEffect(() => {
    if (!selectedDay || !listRef.current) {
      return;
    }

    // start of the selected day's week
    const targetWeekStart = dt.startOfWeek(selectedDay.date, {
      weekStartsOn: 1,
    });

    // find which page index has that week start
    const index = pages.findIndex((p) =>
      dt.isSameDay(p.start, targetWeekStart)
    );

    if (index === -1) {
      return;
    }

    try {
      listRef.current.scrollToIndex({
        index,
        animated: true,
      });
    } catch (err) {
      console.warn("scrollToIndex failed", index, err);
    }
  }, [selectedDay, pages]);

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
                    style={[
                      styles.weekDay,
                      {
                        color: theme.text,
                        backgroundColor: dt.isSameDay(day.date, new Date())
                          ? theme.card
                          : selectedDay &&
                            dt.isSameDay(day.date, selectedDay?.date)
                          ? theme.primary200
                          : null,
                        paddingVertical: 6,
                        borderRadius: 100,
                      },
                    ]}
                  >
                    {dt.format(day.date, "EEEEEE")}
                  </Text>
                </View>
                <Pressable onPress={() => onDaySelect(day)}>
                  <AnimatedCircularProgress
                    key={`${day.date}-${day.percent}`}
                    size={CIRCLE_SIZE}
                    width={CIRCLE_WIDTH}
                    fill={Math.min(100, Math.max(0, day.percent))}
                    tintColor={theme.success}
                    backgroundColor={theme.secondary100}
                    lineCap="round"
                    rotation={0}
                  />
                </Pressable>
                <Text
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
    [statsMap, theme, selectedDay]
  );

  return (
    <FlatList
      ref={listRef}
      data={pages}
      horizontal
      extraData={{ statsMap, selectedDay }}
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
    paddingHorizontal: 8,
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
