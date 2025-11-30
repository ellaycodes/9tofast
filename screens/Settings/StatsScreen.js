import { StyleSheet, Text } from "react-native";
import { View } from "react-native";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import Title from "../../components/ui/Title";
import { useContext } from "react";
import { AppThemeContext } from "../../store/app-theme-context";

export default function Stats() {
  const { theme } = useContext(AppThemeContext);
  return (
    <View style={styles(theme).container}>
      <Title>Streak Management</Title>
      <SettingsPressable
        icon="local-fire-department"
        label="Get your streak back"
        subtitle="This feature can only be used once every 30 days"
        iconColour={theme.error}
      />
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 20,
    },
  });
