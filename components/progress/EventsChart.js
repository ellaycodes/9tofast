import { View, StyleSheet } from "react-native";
import { memo, useMemo } from "react";
import { useAppTheme } from "../../store/app-theme-context";
import * as dt from "date-fns";

// Chart shows fasting/eating segments for current day based on events array
function EventsChart({ events = [] }) {
  const { theme } = useAppTheme();
  const start = dt.startOfDay(new Date()).getTime();
  const end = dt.endOfDay(new Date()).getTime();

  // Filter events within the day and pre-compute segments
  const segments = useMemo(() => {
    const dayEvents = events
      .filter((e) => e.ts >= start && e.ts <= end)
      .sort((a, b) => a.ts - b.ts);

    // Build segments between events
    const segs = [];
    let lastTs = start;
    let fasting = false;
    dayEvents.forEach((ev) => {
      const ts = ev.ts;
      segs.push({ start: lastTs, end: ts, fasting });
      fasting = ev.type === "start";
      lastTs = ts;
    });
    segs.push({ start: lastTs, end, fasting });
    return segs;
  }, [events, start, end]);

  return (
    <View style={styles.container}>
      {segments.map((seg, idx) => (
        <View
          key={idx}
          style={{
            flex: seg.end - seg.start,
            backgroundColor: seg.fasting ? theme.success : theme.error,
          }}
        />
      ))}
    </View>
  );
}

export default memo(EventsChart);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 16,
    borderRadius: 8,
    overflow: "hidden",
    width: "100%",
    marginVertical: 12,
  },
});
