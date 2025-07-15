import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../../store/app-theme-context";

function PrimaryButton({ children, onPress }) {
  const theme = Colors[useContext(AppThemeContext)];
  return (
    <Pressable
      style={({ pressed }) => [
        styles(theme).buttonContainer,
        pressed && styles(theme).pressed,
      ]}
      onPress={onPress}
    >
      <View>
        <Text style={styles(theme).buttonText}>{children}</Text>
      </View>
    </Pressable>
  );
}

export default PrimaryButton;

const styles = (theme) =>
  StyleSheet.create({
    buttonContainer: {
      backgroundColor: theme.primary100,
      padding: 16,
      borderRadius: 50,
      marginHorizontal: 8,
      marginVertical: 16
    },
    pressed: {
      opacity: 0.75,
    },
    buttonText: {
      color: theme.background,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold'
    },
  });
