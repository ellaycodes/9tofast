import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../../store/app-theme-context";

function Countdown({ label, time }) {
  const theme = Colors[useContext(AppThemeContext)];
  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).timeContainer}>
        <Text style={[styles(theme).time, styles(theme).text]}>{time}</Text>
      </View>
      <Text style={[styles(theme).label, styles(theme).text]}>{label.charAt(0).toUpperCase() + label.slice(1)}</Text>
    </View>
  );
}

export default Countdown;

const styles = (theme) =>
  StyleSheet.create({
    container: {
        flex: 1
    },
    timeContainer: {
      paddingVertical: 24,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: theme.secondary100,
    },
    time: {
      fontSize: 24,
      fontWeight: "bold",
    },
    label: {
      fontSize: 20,
      paddingVertical: 16,
    },
    text: {
      color: theme.text,
      textAlign: "center",
    },
  });
