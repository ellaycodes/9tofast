import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function SubtitleText({ children, size, muted, style }) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles(theme).textContainer, style]}>
      <Text style={styles(theme, size, muted).text}>{children}</Text>
    </View>
  );
}

export default SubtitleText;

  const FONT_SIZE = {
    'xs': 12,
    's': 14,
    'm': 16,
    'l': 18,
    'xl': 20
  }

const styles = (theme, size, muted) =>
  StyleSheet.create({
    text: {
      color: muted ? theme.muted : theme.text,
      textAlign: 'center',
      fontSize: FONT_SIZE[size] || 16,
      lineHeight: 26
    },
    textContainer: {
        padding: 6,
        marginVertical: 8
    }
  });
