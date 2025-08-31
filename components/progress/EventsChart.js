import { View, StyleSheet, Text } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import * as dt from "date-fns";

// Chart shows fasting/eating segments for current day based on events array
export default function EventsChart({ events = [] }) {
  const { theme } = useAppTheme();
  const start = dt.startOfDay(new Date()).getTime();
  const end = dt.endOfDay(new Date()).getTime();

  // Filter events within day and sort
  const dayEvents = events
    .filter((e) => e.ts >= start && e.ts <= end)
    .sort((a, b) => a.ts - b.ts);

  // Build segments between events
  const segments = [];
  let lastTs = start;
  let fasting = false;
  dayEvents.forEach((ev) => {
    const ts = ev.ts;
    segments.push({ start: lastTs, end: ts, fasting });
    fasting = ev.type === "start";
    lastTs = ts;
  });
  segments.push({ start: lastTs, end, fasting });

  return (
    <View style={styles.container}>
      {segments.map((seg, idx) => (
        <>
          <View
            key={idx}
            style={{
              flex: seg.end - seg.start,
              backgroundColor:
                seg.fasting === true ? theme.success : theme.error,
            }}
          >
          </View>
          {console.log(seg)}
        </>
      ))}
    </View>
  );
}

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
