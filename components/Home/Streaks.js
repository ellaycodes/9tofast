import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppThemeContext } from "../../store/app-theme-context";
import { StatsContext } from "../../store/statsLogic/stats-context";

export default function Streaks() {
  const { theme } = useContext(AppThemeContext);
  const { currentStreak } = useContext(StatsContext);
  return (
    <View style={styles(theme).container}>
      <Text>🔥</Text>
      <Text style={styles(theme).number}>{currentStreak}</Text>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    number: {
      color: theme.text,
      paddingHorizontal: 5,
      fontWeight: "bold",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.error,
    },
  });
