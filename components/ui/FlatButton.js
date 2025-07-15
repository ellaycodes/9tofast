import { Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../../store/app-theme-context";
import { View } from "react-native";

function FlatButton({ children, onPress }) {
  const theme = Colors[useContext(AppThemeContext)];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles(theme).container,
        pressed && styles(theme).pressed,
      ]}
    >
      <View>
        <Text style={styles(theme).text}>{children}</Text>
      </View>
    </Pressable>
  );
}

export default FlatButton;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      padding: 8,
    },
    pressed: {
      opacity: 0.7,
    },
    text: {
      color: theme.muted,
      textAlign: "center",
    },
  });
