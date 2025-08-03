import { Text, Pressable, StyleSheet, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import { formatTime } from "../../util/formatTime";

function CustomSelector({ label, time, onPress }) {
  const { theme } = useAppTheme();
  
  return (
    <View>
      <Text style={styles(theme).customLabel}>{label}</Text>
      <Pressable
        style={({ pressed }) => [
          styles(theme).timeButton,
          pressed && styles(theme).timeButtonActive,
        ]}
        onPress={onPress}
      >
        <Text style={styles(theme).timeText}>{time}</Text>
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
