import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../../store/app-theme-context";

function CarouselButton({ children, onPress, highlight }) {
  const theme = Colors[useContext(AppThemeContext)];
  return (
    <Pressable style={styles(theme, highlight).container} onPress={onPress}>
      <View style={styles(theme, highlight).border}>
        <Text style={styles(theme, highlight).text}>{children}</Text>
      </View>
    </Pressable>
  );
}

export default CarouselButton;

const styles = (theme, highlight) =>
  StyleSheet.create({
    container: {
      margin: 8,
      alignItems: "flex-start",
    },
    border: {
      backgroundColor: highlight ? theme.primary100 : theme.background,
      borderColor: highlight ? theme.background : theme.border,
      borderWidth: 2,
      padding: 16,
      borderRadius: 16,
      transform: highlight ? [{ scale: 1.05 }] : 'none', 
    },
    text: {
      color: highlight ? theme.background : theme.text,
      fontSize: 16,
    },
  });
