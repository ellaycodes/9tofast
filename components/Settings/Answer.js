import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function Answer({ children }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).left}></View>
      <Text style={styles(theme).text}>{children}</Text>
    </View>
  );
}

export default Answer;

const styles = (theme) =>
  StyleSheet.create({
    container: {
        margin: 16,
        flexDirection: 'row',
    },
    left: {
        width: '2%',
        height: '100%',
        backgroundColor: theme.secondary100,
    },
    text: {
      color: theme.text,
      marginHorizontal: 18
    },
  });
