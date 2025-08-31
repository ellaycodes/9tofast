import { useAppTheme } from "../../store/app-theme-context";
import { StyleSheet } from "react-native";
import { TextInput, View } from "react-native";

function Input({ label, value, secure, onUpdateText, keyboardType, style }) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles(theme).inputContainer, style]}>
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
        placeholder={label}
        placeholderTextColor={theme.muted}
        returnKeyType="next"
      />
    </View>
  );
}

export default Input;

const styles = (theme) =>
  StyleSheet.create({
    inputContainer: {
      marginVertical: 8,
      width: "100%",
    },
    textInput: {
      padding: 20,
      borderRadius: 10,
      margin: 8,
      color: theme.text,
      backgroundColor: theme.secondary200,
    }
  });
