import { useMemo } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import * as dt from "date-fns";
import { AnimatedCircularProgress } from "react-native-circular-progress";

import { buildDayLookupValue } from "../../util/progress/stats";
import { formatDayString } from "../../util/timezone";

export default function MonthGrid({
  monthDate,
  theme,
  statsMap,
  limitDays,
  onDayPress,
  timeZone
}) {
  const startOfMonth = dt.startOfMonth(monthDate);

  const days = useMemo(() => {
    const total = dt.getDaysInMonth(startOfMonth);
    const count = limitDays ? Math.min(limitDays, total) : total;
    const startDay = dt.getDay(startOfMonth);
    const offset = (startDay + 6) % 7;

    return Array.from({ length: offset + count }).map((_, i) => {
      if (i < offset) {
        return { placeholder: true };
      }

      const d = dt.addDays(startOfMonth, i - offset);
      const key = formatDayString(d, timeZone);
      const lookup = buildDayLookupValue(statsMap.get(key));

      return {
        placeholder: false,
        date: d,
        ...lookup
      };
    });
  }, [monthDate, statsMap, limitDays, startOfMonth, timeZone]);

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
                  {dt.format(item.date, "d")}
                </Text>
                <Pressable onPress={() => onDayPress && onDayPress(item)}>
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
                </Pressable>
              </>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
