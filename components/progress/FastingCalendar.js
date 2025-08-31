import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import { useEffect, useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as dt from "date-fns";
import useWeeklyStats from "../../store/fastingLogic/useWeeklyStats";

const CELL_SIZE = `${100 / 7}%`;

function FastingCalendar() {
  const { theme } = useAppTheme();
  const { weeklyStats, refreshWeeklyStats } = useWeeklyStats();
  const [currentMonth, setCurrentMonth] = useState(dt.startOfMonth(new Date()));

  useEffect(() => {
    const start = dt.startOfMonth(currentMonth);
    const end = dt.endOfMonth(currentMonth);
    refreshWeeklyStats(start, end);
  }, [currentMonth, refreshWeeklyStats]);

  const days = useMemo(() => {
    const startDate = dt.startOfWeek(dt.startOfMonth(currentMonth), {
      weekStartsOn: 0,
    });
    const list = [];
    for (let i = 0; i < 42; i++) {
      const day = dt.addDays(startDate, i);
      const formatted = dt.format(day, "yyyy-MM-dd");
      const stat = weeklyStats.find((s) => s.day === formatted);
      list.push({ date: day, percent: stat?.percent ?? 0 });
    }
    return list;
  }, [currentMonth, weeklyStats]);

  const handlePrev = () => setCurrentMonth(dt.subMonths(currentMonth, 1));
  const handleNext = () => setCurrentMonth(dt.addMonths(currentMonth, 1));

  const cellSize = CELL_SIZE;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handlePrev} style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: theme.text }]}>
          {dt.format(currentMonth, "MMMM yyyy")}
        </Text>
        <Pressable onPress={handleNext} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {"SMTWTFS".split("").map((d, i) => (
          <Text
            key={d + i}
            style={[styles.weekDay, { color: theme.muted, width: cellSize }]}
          >
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.days}>
        {days.map((item, idx) => {
          const inMonth = dt.isSameMonth(item.date, currentMonth);
          const bg = item.percent > 0 ? theme.success : "transparent";
          return (
            <View
              key={idx}
              style={[
                styles.dayCell,
                {
                  width: cellSize,
                  borderColor: theme.secondary200,
                  opacity: inMonth ? 1 : 0.3,
                },
              ]}
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: bg, borderRadius: 6 },
                ]}
              />
              <Text style={[styles.dayText, { color: theme.text }]}>
                {dt.getDate(item.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default FastingCalendar;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  navButton: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  weekDay: {
    textAlign: "center",
    fontWeight: "600",
  },
  days: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 4,
    overflow: "hidden",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
