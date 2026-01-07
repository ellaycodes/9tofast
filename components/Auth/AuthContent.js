import AuthForm from "./AuthForm";
import FlatButton from "../ui/FlatButton";
import { useNavigation } from "@react-navigation/native";
import Header from "./Header";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StyleSheet } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import { Alert } from "react-native";
import { useState } from "react";

function AuthContent({ isLogin, authenticate }) {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const [credentialsInvalid, setCredentialsInvalid] = useState({});

  function switchAuthModeHandler() {
    if (isLogin) {
      navigation.replace("SignupScreen");
    } else {
      navigation.replace("LoginScreen");
    }
  }

  function signInDifferently() {
    navigation.replace("PreAuthScreen");
  }

  function submitHandler(authDetails) {
    let { email, confirmEmail, password, confirmPassword } = authDetails;

    const emailIsValid = email.includes("@");
    const passwordIsValid = password.length > 6;
    const emailsAreEqual = email === confirmEmail;
    const passwordsAreEqual = password === confirmPassword;

    if (
      !emailIsValid ||
      !passwordIsValid ||
      (!isLogin && (!emailsAreEqual || !passwordsAreEqual))
    ) {
      Alert.alert("Invalid input", "Please check your entered credentials.");
      setCredentialsInvalid({
        email: !emailIsValid,
        confirmEmail: !emailIsValid || !emailsAreEqual,
        password: !passwordIsValid,
        confirmPassword: !passwordIsValid || !passwordsAreEqual,
      });
      return;
    }
    setCredentialsInvalid({});
    authenticate({ email, password });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "position" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Header>{isLogin ? "Log In" : "Sign Up"}</Header>

        <AuthForm
          isLogin={isLogin}
          onSubmit={submitHandler}
          credentialsInvalid={credentialsInvalid}
        />

        <View style={styles.flatbuttonContainer}>
          <FlatButton onPress={switchAuthModeHandler}>
            {isLogin ? "Create Account" : "I already have an account"}
          </FlatButton>
          <Text style={{ color: theme.muted }}> | </Text>
          <FlatButton onPress={signInDifferently}>
            Sign in a different way
          </FlatButton>
        </View>

        {isLogin && (
          <FlatButton onPress={() => navigation.navigate("ForgottenPassword")}>
            Forgotten Password?
          </FlatButton>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default AuthContent;

const styles = StyleSheet.create({
  flatbuttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },
});
