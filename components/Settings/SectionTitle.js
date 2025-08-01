import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function SectionTitle({ children }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).text}>{children}</Text>
    </View>
  );
}

export default SectionTitle;

const styles = (theme) =>
  StyleSheet.create({
    text: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 22,
    },
    container: {
      margin: 16
    }
  });
