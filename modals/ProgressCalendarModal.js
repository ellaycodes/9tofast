import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  Text,
  FlatList,
} from "react-native";
import { useAppTheme } from "../store/app-theme-context";
import FlatButton from "../components/ui/FlatButton";
import * as dt from "date-fns";
import { useMemo, useRef, useState } from "react";
import useWeeklyStats from "../store/fastingLogic/useWeeklyStats";
import MonthGrid from "../components/progress/MonthGrid";
import { buildStatsMap } from "../util/progress/stats";
import { useFasting } from "../store/fastingLogic/fasting-context";
import { getScheduleTimeZone } from "../util/timezone";

export default function ProgressCalendarModal({
  showModal,
  onRequestClose,
  onDaySelect,
}) {
  const { theme } = useAppTheme();
  const { weeklyStats, refreshWeeklyStats } = useWeeklyStats();
  const { schedule } = useFasting();
  const timeZone = getScheduleTimeZone(schedule);
  const currentMonthStart = useMemo(() => dt.startOfMonth(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(
    dt.format(new Date(), "MMMM yyyy")
  );

  // build a rolling list of months, index 0 is next month, 1 is current, etc
  const months = useMemo(() => {
    const nextMonth = dt.startOfMonth(dt.addMonths(new Date(), 1));
    return Array.from({ length: 50 }).map((_, idx) => {
      const m = dt.startOfMonth(dt.subMonths(nextMonth, idx));
      return {
        key: dt.format(m, "yyyy-MM"),
        month: m,
        limit: idx === 0 ? 7 : undefined,
      };
    });
  }, []);

  // hydrate stats and update header on view change
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (!viewableItems || !viewableItems.length) return;
    const firstItem = viewableItems[0];
    const first = firstItem ? firstItem.item : undefined;
    if (!first) return;
    const start = dt.startOfMonth(dt.subMonths(first.month, 2));
    const end = dt.endOfMonth(dt.addMonths(first.month, 2));

    refreshWeeklyStats(start, end);
    const monthToDisplay = dt.isAfter(first.month, currentMonthStart)
      ? dt.max([currentMonthStart])
      : first.month;
    setVisibleMonth(dt.format(monthToDisplay, "MMMM yyyy"));
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const statsMap = useMemo(() => buildStatsMap(weeklyStats), [weeklyStats]);

  const handleDayPress = (day) => {
    if (onDaySelect) {
      onDaySelect({
        date: day.date,
        percent: day.percent,
        hoursFastedToday: day.hoursFastedToday,
        events: day.events,
      });
    }
    onRequestClose();
  };

  const renderMonth = ({ item }) => (
    <View style={styles.monthContainer}>
      <Text style={[styles.monthLabel, { color: theme.text }]}>
        {dt.format(item.month, "MMM")}
      </Text>
      <MonthGrid
        monthDate={item.month}
        theme={theme}
        statsMap={statsMap}
        limitDays={item.limit}
        onDayPress={handleDayPress}
        timeZone={timeZone}
      />
    </View>
  );

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <Pressable onPress={onRequestClose} style={styles.modalBackdrop} />
      <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
        <View style={styles.modalHeader}>
          <FlatButton size="l" onPress={onRequestClose}>
            Close
          </FlatButton>
          <Text style={[styles.headerHint, { color: theme.muted }]}>
            {visibleMonth}
          </Text>
        </View>
        <View style={styles.weekRow}>
          {"Mo,Tu,We,Th,Fr,Sa,Su".split(",").map((d, i) => (
            <Text key={d + i} style={[styles.weekDay, { color: theme.muted }]}>
              {d}
            </Text>
          ))}
        </View>

        <FlatList
          data={months}
          renderItem={renderMonth}
          keyExtractor={(m) => m.key}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          inverted
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalSheet: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headerHint: {
    fontSize: 18,
    fontWeight: "bold",
  },
  monthLabel: {
    textAlign: "left",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 16,
  },
  monthContainer: {
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  weekDay: {
    textAlign: "center",
    fontSize: 12,
    flex: 1,
  },
});
