import { useAppTheme } from "../../store/app-theme-context";
import { StyleSheet } from "react-native";
import { TextInput, View } from "react-native";

function Input({
  label,
  value,
  secure,
  onUpdateText,
  keyboardType,
  style,
  children,
  error,
  autoComplete,
  textContentType,
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles(theme).inputContainer,
        style,
        error && styles(theme).inputContainerError,
      ]}
    >
      <TextInput
        value={value}
        style={styles(theme).textInput}
        secureTextEntry={secure}
        onChangeText={onUpdateText}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor={theme.muted}
        returnKeyType="next"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        textContentType={textContentType}
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
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 20,
      backgroundColor: theme.secondary200,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "transparent",
    },
    textInput: {
      padding: 16,
      margin: 8,
      color: theme.darkText,
      flex: 1
    },
    inputContainerError: {
      borderColor: theme.error,
    },
  });
