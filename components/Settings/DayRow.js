import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../store/app-theme-context";
import * as dt from "date-fns";

const DAY_SHORT = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function formatConfigSummary(config) {
  if (!config) return "Not set";
  if (config.type === "rest") return "Rest Day";
  const start = dt.format(dt.parse(config.start, "HH:mm", new Date()), "p");
  const end = dt.format(dt.parse(config.end, "HH:mm", new Date()), "p");
  const fh = config.fastingHours;
  const prefix =
    fh != null && Number.isInteger(fh) ? `${fh}:${24 - fh} · ` : "";
  return `${prefix}${start} – ${end}`;
}

export default function DayRow({ dayKey, config, onPress }) {
  const { theme } = useAppTheme();
  return (
    <Pressable style={styles(theme).row} onPress={onPress}>
      <Text style={styles(theme).dayName}>{DAY_SHORT[dayKey]}</Text>
      <Text style={styles(theme).summary} numberOfLines={1}>
        {formatConfigSummary(config)}
      </Text>
      <MaterialIcons name="chevron-right" size={20} color={theme.muted} />
    </Pressable>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    dayName: {
      width: 36,
      color: theme.text,
      fontSize: 15,
      fontWeight: "600",
    },
    summary: {
      flex: 1,
      color: theme.muted,
      fontSize: 14,
      marginRight: 4,
    },
  });
