import { AppThemeContext } from "../../store/app-theme-context";
import { useContext } from "react";
import { StyleSheet } from "react-native";
import { TextInput, View, Text } from "react-native";
import { Colors } from "../../constants/Colors";

function Input({ label, value, secure, onUpdateText, keyboardType }) {
  const theme = Colors[useContext(AppThemeContext)];

  return (
    <View style={styles(theme).inputContainer}>
      <Text style={styles(theme).text}>{label}</Text>
      <TextInput
        value={value}
        style={styles(theme).textInput}
        secureTextEntry={secure}
        onChangeText={onUpdateText}
        keyboardType={keyboardType}
        autoComplete="off"
        importantForAutofill="no"
        textContentType="none"
        disableFullscreenUI={true}
      />
    </View>
  );
}

export default Input;

const styles = (theme) =>
  StyleSheet.create({
    inputContainer: {
      marginVertical: 8,
    },
    textInput: {
      padding: 16,
      borderColor: theme.border,
      borderWidth: 2,
      borderRadius: 30,
      margin: 8,
      color: theme.text,
    },
    text: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "bold",
      marginLeft: 8,
      marginBottom: 4,
    },
  });
