import { useAppTheme } from "../../store/app-theme-context";
import { StyleSheet } from "react-native";
import { TextInput, View } from "react-native";

function Input({ label, value, secure, onUpdateText, keyboardType, style, children }) {
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
      {children}
    </View>
  );
}

export default Input;

const styles = (theme) =>
  StyleSheet.create({
    inputContainer: {
      marginVertical: 12,
      width: "100%",
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: 20,
      backgroundColor: theme.secondary200,
      borderRadius: 10,
    },
    textInput: {
      padding: 16,
      margin: 8,
      color: theme.text,
      flex: 1
    }
  });
