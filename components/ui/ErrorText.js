import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function ErrorText({ children }) {
  const { theme } = useAppTheme();
  return <Text style={styles(theme).errorText}>{children}</Text>;
}

export default ErrorText;

const styles = (theme) =>
  StyleSheet.create({
    errorText: {
      color: theme.error,
      fontWeight: 'bold',
      alignSelf: 'center'
    },
  });
