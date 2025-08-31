import { Text, Pressable, StyleSheet, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import { useMemo } from "react";

function CustomSelector({ label, time, onPress }) {
  const { theme } = useAppTheme();
  const memoStyle = useMemo(() => styles(theme), [theme]);

  return (
    <View>
      <Text style={memoStyle.customLabel}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          memoStyle.timeButton,
          pressed && memoStyle.timeButtonActive,
        ]}
        onPress={onPress}
      >
        <Text style={memoStyle.timeText}>{time}</Text>
      </Pressable>
    </View>
  );
}

export default CustomSelector;

const styles = (theme) =>
  StyleSheet.create({
    customLabel: {
      color: theme.text,
      fontSize: 14,
      marginBottom: 4,
    },
    timeButton: {
      borderColor: theme.border,
      borderWidth: 2,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      marginVertical: 4,
      backgroundColor: theme.card,
    },
    timeButtonActive: {
      opacity: 0.6,
    },
    timeText: {
      color: theme.text,
      fontSize: 18,
    },
  });
