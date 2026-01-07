import { useState } from "react";
import { useAppTheme } from "../../store/app-theme-context";
import { Platform, StyleSheet } from "react-native";
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
  textContentType
}) {
  const { theme } = useAppTheme();
  const [iosSecureFix, setIosSecureFix] = useState(true);

  function handleFocus() {
    if (Platform.OS === "ios" && secure) {
      setIosSecureFix(false);
      requestAnimationFrame(() => setIosSecureFix(true));
    }
  }

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
        secureTextEntry={secure && iosSecureFix}
        onChangeText={onUpdateText}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor={theme.muted}
        returnKeyType="next"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType={secure ? "oneTimeCode" : textContentType}
        autoComplete={secure ? "off" : "on"}
        passwordRules={secure ? "" : undefined}
        importantForAutofill={secure ? "no" : "auto"} 
        onFocus={handleFocus}
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
      color: theme.text,
      flex: 1,
    },
    inputContainerError: {
      borderColor: theme.error,
    },
  });
