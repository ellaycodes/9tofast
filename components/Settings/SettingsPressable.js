import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import SubtitleText from "../ui/SubtitleText";

function SettingsPressable({ profile = false, label, icon, onPress, subtitle, style, backgroundColor }) {
  const { theme } = useAppTheme();
  
  return (
    <Pressable onPress={onPress} style={[styles(theme).container, style]}>
      <View style={[styles(theme, profile).iconContainer, backgroundColor]}>
        <MaterialIcons name={icon} size={profile ? 50 : 24} color={theme.text} />
      </View>
      <View>
        <Text style={styles(theme).label}>{label}</Text>
        {subtitle && <SubtitleText size='xs' muted style={{padding: 0, marginVertical: 0, textAlign: 'left'}}>{subtitle}</SubtitleText>}
      </View>
    </Pressable>
  );
}

export default SettingsPressable;

const styles = (theme, profile) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      marginVertical: profile ? 20 : 8,
    },
    iconContainer: {
      backgroundColor: theme.secondary100,
      padding: 12,
      borderRadius: profile ? 50 : 8,
    },
    label: {
      color: theme.text,
      fontSize: 18,
    },
  });
