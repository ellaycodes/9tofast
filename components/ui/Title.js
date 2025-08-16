import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function Title({ children, style, size = 30 }) {
  const { theme } = useAppTheme();
  
  return (
    <View style={[styles(theme).container, style]}>
      <Text style={[styles(theme, size).titleText, style]}>{children}</Text>
    </View>
  );
}

export default Title;

const styles = (theme, size) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      padding: 18,
      alignItems: "center",
      marginBottom: 4
    },
    titleText: {
      fontSize: size,
      color: theme.text,
      fontWeight: "bold",
      textAlign: "center",
    },
  });
