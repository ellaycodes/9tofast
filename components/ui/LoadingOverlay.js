import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function LoadingOverlay({ children }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles(theme).container}>
      <ActivityIndicator size={"large"} color={theme.primary100} />
      <Text style={styles(theme).text}>{children}...</Text>
    </View>
  );
}

export default LoadingOverlay;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: theme.text,
      marginVertical: 16,
      fontSize: 16,
    },
  });
