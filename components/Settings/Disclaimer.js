import { View, Text, StyleSheet } from "react-native";
import FlatButton from "../ui/FlatButton";
import { useAppTheme } from "../../store/app-theme-context";

export default function Disclaimer() {
  const { theme } = useAppTheme();
  return (
    <View style={s(theme).card} accessibilityRole="summary">
      <View style={s(theme).headerRow}>
        <View style={s(theme).badge}>
          <Text style={s(theme).badgeText}>i</Text>
        </View>
        <Text style={s(theme).title}>Disclaimer</Text>
      </View>

      <Text style={s(theme).body}>
        9ToFast does not provide medical advice. Speak to a healthcare
        professional if you have any medical conditions, are pregnant, or have a
        history of eating disorders.
      </Text>
      {/* <FlatButton
        size="xs"
        style={{ paddingHorizontal: 0, textAlign: "left", color: theme.primary200 }}
        onPress={() => console.log('TODO')}
      >
        learn more
      </FlatButton> */}
    </View>
  );
}

const s = (theme) =>
  StyleSheet.create({
    card: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.secondary100,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    badge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.secondary200,
      marginRight: 8,
    },
    badgeText: { fontWeight: "700", fontSize: 12, color: theme.text },
    title: { fontWeight: "600", fontSize: 14, color: theme.text },
    body: { fontSize: 12, lineHeight: 18, color: theme.text },
  });
