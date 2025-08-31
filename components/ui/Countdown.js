import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function Countdown({ label, time, small }) {
  const { theme } = useAppTheme();

  const formattedLabel =
    typeof label === "string" && label.length
      ? label.charAt(0).toUpperCase() + label.slice(1)
      : "";

  return (
    <View style={styles(theme, small).container}>
      <View style={styles(theme, small).timeContainer}>
        <Text style={[styles(theme, small).time, styles(theme, small).text]}>
          {time}
        </Text>
      </View>
      <Text style={[styles(theme, small).label, styles(theme, small).text]}>
        {formattedLabel}
      </Text>
    </View>
  );
}

export default Countdown;

const styles = (theme, small) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    timeContainer: {
      paddingVertical: small ? 12 : 24,
      paddingHorizontal: small ? 8 : 16,
      borderRadius: small ? 8 : 16,
      backgroundColor: theme.secondary100,
    },
    time: {
      fontSize: small ? 12 : 24,
      fontWeight: "bold",
    },
    label: {
      fontSize: small ? 10 : 20,
      paddingVertical: small ? 8 : 16,
    },
    text: {
      color: theme.text,
      textAlign: "center",
    },
  });
