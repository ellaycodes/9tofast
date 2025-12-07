import { useContext } from "react";
import { Text, View, StyleSheet } from "react-native";
import { AppThemeContext } from "../../store/app-theme-context";
import { Ionicons } from "@expo/vector-icons";

export default function StatsCard({ name, content, icon, emoji, highlight }) {
  const { theme } = useContext(AppThemeContext);
  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).contentSection}>
        <Text style={styles(theme, highlight).content}>{content}</Text>
        <Ionicons name={icon} size={48} color={theme.secondary100} />
      </View>
      <View style={styles(theme).cardNameSection}>
        <Text>{emoji}</Text>
        <Text style={styles(theme).name}>{name}</Text>
      </View>
    </View>
  );
}

const styles = (theme, highlight) =>
  StyleSheet.create({
    container: {
      width: "auto",
      height: "auto",
      backgroundColor: theme.secondary200,
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    contentSection: {
      flexDirection: "row",
      justifyContent: "space-between"
    },
    content: {
      fontSize: 56,
      color: highlight ? theme.primary100 : theme.muted,
      fontWeight: "bold",
    },
    cardNameSection: {
        flexDirection:'row',
        gap: 8,
        alignItems: 'center'
    },
    name: {
        fontSize: 16,
        color: theme.text
    },
  });
