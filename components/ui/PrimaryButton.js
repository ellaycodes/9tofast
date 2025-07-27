import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../../store/app-theme-context";

function PrimaryButton({ children, onPress, lowlight, style }) {
  const theme = Colors[useContext(AppThemeContext)];
  return (
    <Pressable
      style={({ pressed }) => [
        styles(theme, lowlight).buttonContainer,
        pressed && styles(theme).pressed,
        style,
      ]}
      onPress={onPress}
    >
      <View>
        <Text style={styles(theme, lowlight).buttonText}>{children}</Text>
      </View>
    </Pressable>
  );
}

export default PrimaryButton;

const styles = (theme, lowlight) =>
  StyleSheet.create({
    buttonContainer: {
      backgroundColor: lowlight ? theme.secondary100 : theme.primary100,
      paddingVertical: 18,
      borderRadius: 50,
      marginHorizontal: 4,
      marginVertical: 8,
      alignContent: "center",
      justifyContent: "center",
    },
    pressed: {
      opacity: 0.75,
    },
    buttonText: {
      color: lowlight ? theme.text : theme.background,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
