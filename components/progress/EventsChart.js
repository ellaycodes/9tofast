import { View, StyleSheet, Text } from "react-native";
import { memo, useMemo } from "react";
import { useAppTheme } from "../../store/app-theme-context";
import * as dt from "date-fns";
import SubtitleText from "../ui/SubtitleText";

// Chart shows fasting/eating segments for current day based on events array
function EventsChart({ events = [] }) {
  const { theme } = useAppTheme();
  const start = dt.startOfDay(new Date()).getTime();
  const end = dt.endOfDay(new Date()).getTime();
  const total = end - start;

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
    return segs.filter((s) => s.end > s.start);
  }, [events, start, end]);

  const labels = ["00:00", "06:00", "12:00", "18:00", "24:00"];

  return (
    <View style={styles.wrapper}>
      <SubtitleText size="s" style={{textAlign: 'left', margin: 0, padding: 0}} >Fasting Events</SubtitleText>
      <View style={styles.container}>
        {segments.map((seg, idx) => (
          <View
            key={idx}
            style={{
              width: `${((seg.end - seg.start) / total) * 100}%`,
              backgroundColor: seg.fasting ? theme.success : theme.secondary100,
              flexGrow: seg.end - seg.start,
              flexBasis: 0,
              flexShrink: 0,
              minWidth: StyleSheet.hairlineWidth,
            }}
          />
        ))}
      </View>
      <View style={styles.axis}>
        {labels.map((label) => (
          <Text key={label} style={[styles.axisLabel, { color: theme.text }]}>
            {label}
          </Text>
        ))}
      </View>
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
  wrapper: {
    width: "100%",
    marginVertical: 12,
  },
  axis: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
  },
  axisLabel: {
    fontSize: 10,
  },
});
