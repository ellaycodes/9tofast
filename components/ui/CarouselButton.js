import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../../store/app-theme-context";

function CarouselButton({ children, onPress }) {
  const theme = Colors[useContext(AppThemeContext)];
  return (
    <Pressable style={styles(theme).container} onPress={onPress}>
      <View style={styles(theme).border}>
        <Text style={styles(theme).text}>{children}</Text>
      </View>
    </Pressable>
  );
}

export default CarouselButton;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      margin: 8,
      alignItems: 'flex-start'
    },
    border: {
      borderColor: theme.border,
      borderWidth: 2,
      padding: 16,
      borderRadius: 16
    },
    text: {
      color: theme.text,
      fontSize: 16,
    },
  });
