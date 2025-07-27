import { Text, StyleSheet } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function FlatButton({ children, onPress, inline, size = "m" }) {
  const { theme } = useAppTheme();
  return (
    <Text onPress={onPress} style={styles(theme, inline, size).text}>
      {children}
    </Text>
  );
}

export default FlatButton;

const FONT_SIZE = {
  xs: 12,
  s: 14,
  m: 16,
  l: 18,
  xl: 20,
};

const styles = (theme, inline, size) =>
  StyleSheet.create({
    text: {
      color: theme.muted,
      textAlign: "center",
      textAlignVertical: "center",
      includeFontPadding: false,
      fontSize: FONT_SIZE[size],
      padding: inline ? 0 : 8,
      textDecorationLine: inline ? "underline" : "none",
    },
  });
