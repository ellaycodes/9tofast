import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import SubtitleText from "../ui/SubtitleText";
import { useContext } from "react";
import { AuthContext } from "../../store/auth-context";
import AvatarSegment from "../ui/AvatarSegment";

function SettingsPressable({
  profile = false,
  themeIcon,
  label,
  icon,
  onPress,
  subtitle,
  style,
  backgroundColor,
  iconColour,
}) {
  const { theme } = useAppTheme();
  const authCxt = useContext(AuthContext);

  return (
    <Pressable onPress={onPress} style={[styles(theme).container, style]}>
      {profile && authCxt.avatarId ? (
        <AvatarSegment small={true} avatarId={authCxt.avatarId} />
      ) : (
        <View style={[styles(theme, profile).iconContainer, backgroundColor]}>
          <MaterialIcons
            name={icon}
            size={themeIcon || profile ? 50 : 24}
            color={iconColour || theme.muted}
          />
        </View>
      )}
      <View>
        <Text style={styles(theme, profile).label}>{label}</Text>
        {subtitle && (
          <SubtitleText
            size="xs"
            muted
            style={{ padding: 0, marginVertical: 0, textAlign: "left" }}
          >
            {subtitle}
          </SubtitleText>
        )}
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
