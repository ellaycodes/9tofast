import { StyleSheet, Text, View } from "react-native";
import Title from "./Title";
import { AppThemeContext } from "../../store/app-theme-context";
import { useContext } from "react";

export default function Section({ children, title }) {
  const { theme } = useContext(AppThemeContext);

  return (
    <View style={styles(theme).container}>
      <Title style={styles(theme).title} size={20}>{title}</Title>
      <View style={styles(theme).children}>{children}</View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      height: "auto",
      borderColor: theme.secondary200,
      borderWidth: 1,
      borderRadius: 20,
      marginVertical: 24
    },
    title: {
        alignItems: "flex-start",
        marginBottom: 0,
        paddingBottom: 0
    },
    children: {
        flexDirection: 'row',
        gap: 12,
        padding: 12
    }
  });
