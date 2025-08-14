import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../store/app-theme-context";

export default function SettingsRow({ label, right, onPress }) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s(theme).row,
        pressed && onPress && s(theme).pressed,
      ]}
    >
      <Text style={s(theme).label}>{label}</Text>
      <View style={s(theme).right}>
        {typeof right === "string" ? (
          <Text style={s(theme).rightText}>{right}</Text>
        ) : (
          right
        )}
        {onPress && (
          <Ionicons name="chevron-forward" size={20} style={s(theme).chev} />
        )}
      </View>
    </Pressable>
  );
}

const s = (theme) =>
  StyleSheet.create({
    row: {
      minHeight: 48,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    pressed: { opacity: 0.6 },
    label: { fontSize: 16, color: theme.text, fontWeight: "600" },
    right: { flexDirection: "row", alignItems: "center" },
    rightText: { fontSize: 16, color: theme.muted, marginRight: 8 },
    chev: { color: theme.muted },
  });
