import AuthForm from "./AuthForm";
import FlatButton from "../ui/FlatButton";
import { useNavigation } from "@react-navigation/native";
import Title from "./Title";
import { View } from "react-native";

function AuthContent({ isLogin, authenticate }) {
  const navigation = useNavigation();

  function switchAuthModeHandler() {
    if (isLogin) {
      navigation.replace("SignupScreen");
    } else {
      navigation.replace("LoginScreen");
    }
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
    authenticate({ email, password });
  }

  return (
    <View>
      <Title>{isLogin ? "Log In" : "Sign Up"}</Title>
      <AuthForm isLogin={isLogin} onSubmit={submitHandler} />
      <View>
        <FlatButton onPress={switchAuthModeHandler}>
          {isLogin ? "Create Account" : "I already have an account"}
        </FlatButton>
      </View>
    </View>
  );
}

export default AuthContent;
