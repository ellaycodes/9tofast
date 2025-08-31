import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import { useMemo } from "react";

function Answer({ children }) {
  const { theme } = useAppTheme();
  const memoStyle = useMemo(() => styles(theme), [theme]);

  return (
    <View style={memoStyle.container}>
      <View style={memoStyle.left}></View>
      <Text style={memoStyle.text}>{children}</Text>
    </View>
  );
}

export default Answer;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      margin: 16,
      flexDirection: "row",
    },
    left: {
      width: "2%",
      height: "100%",
      backgroundColor: theme.secondary100,
    },
    text: {
      color: theme.text,
      marginHorizontal: 18,
    },
  });
