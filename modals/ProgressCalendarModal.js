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
import { AnimatedCircularProgress } from "react-native-circular-progress";

function MonthGrid({ monthDate, theme, statsMap, limitDays }) {
  const startOfMonth = dt.startOfMonth(monthDate);

  const days = useMemo(() => {
    const total = dt.getDaysInMonth(startOfMonth);
    const count = limitDays ? Math.min(limitDays, total) : total;
    const startDay = dt.getDay(startOfMonth);
    const offset = (startDay + 6) % 7;
    return Array.from({ length: offset + count }).map((_, i) => {
      if (i < offset) {
        return { placeholder: true, date: "", percent: 0 };
      }
      const d = dt.addDays(startOfMonth, i - offset);
      const key = dt.format(d, "yyyy-MM-dd");

      return {
        date: dt.format(d, "d"),
        percent: statsMap.get(key) ?? 0,
      };
    });
  }, [monthDate, statsMap, limitDays, startOfMonth]);

  return (
    <View>
      <View style={styles.days}>
        {days.map((item, idx) => (
          <View key={idx} style={styles.dayCell}>
            {item.placeholder ? null : (
              <>
                <Text
                  style={{ color: theme.text, fontSize: 12, paddingBottom: 6 }}
                >
                  {item.date}
                </Text>
                <AnimatedCircularProgress
                  size={35}
                  width={8}
                  fill={Math.min(100, Math.max(0, item.percent))}
                  tintColor={theme.success}
                  backgroundColor={theme.secondary100}
                  lineCap="round"
                  rotation={0}
                  duration={0}
                />
              </>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProgressCalendarModal({ showModal, onRequestClose }) {
  const { theme } = useAppTheme();
  const { weeklyStats, refreshWeeklyStats } = useWeeklyStats();
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
    if (!viewableItems?.length) return;
    const first = viewableItems[0]?.item;
    if (!first) return;
    const start = dt.startOfMonth(dt.subMonths(first.month, 1));
    const end = dt.endOfMonth(dt.addMonths(first.month, 1));

    refreshWeeklyStats(start, end);
    setVisibleMonth(dt.format(first.month, "MMMM yyyy"));
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 100,
  }).current;

  const statsMap = useMemo(() => {
    const m = new Map();
    weeklyStats.forEach((s) => m.set(s.day, s.percent ?? 0));
    return m;
  }, [weeklyStats]);

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
    height: "85%",
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
  days: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
