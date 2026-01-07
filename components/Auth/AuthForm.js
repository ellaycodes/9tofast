import { useState } from "react";
import { Pressable, View, KeyboardAvoidingView } from "react-native";
import Input from "./Input";
import PrimaryButton from "../ui/PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../store/app-theme-context";

function AuthForm({ isLogin, onSubmit, credentialsInvalid }) {
  const [secure, setSecure] = useState(true);
  const [secure2, setSecure2] = useState(true);
  const { theme } = useAppTheme();
  const [authDetails, setAuthDetails] = useState({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  function handleInputs(type, value) {
    switch (type) {
      case "email":
        setAuthDetails((authDetails) => ({
          ...authDetails,
          email: value,
        }));
        break;
      case "confirmEmail":
        setAuthDetails((authDetails) => ({
          ...authDetails,
          confirmEmail: value,
        }));
        break;
      case "password":
        setAuthDetails((authDetails) => ({
          ...authDetails,
          password: value,
        }));
        break;
      case "confirmPassword":
        setAuthDetails((authDetails) => ({
          ...authDetails,
          confirmPassword: value,
        }));
        break;
    }
  }

  function onSubmitHandler() {
    onSubmit({
      email: authDetails.email.trim(),
      password: authDetails.password.trim(),
      confirmEmail: authDetails.confirmEmail.trim(),
      confirmPassword: authDetails.confirmPassword.trim(),
    });
  }

  return (
    <View>
      {/* <KeyboardAvoidingView style={{ flex: 1 }}> */}
      <Input
        label="Email"
        value={authDetails.email}
        secure={false}
        onUpdateText={handleInputs.bind(this, "email")}
        keyboardType="email-address"
        error={!!credentialsInvalid?.email}
        autoComplete="email"
        textContentType="emailAddress"
      />
      {!isLogin && (
        <Input
          label="Confirm Email"
          value={authDetails.confirmEmail}
          secure={false}
          onUpdateText={handleInputs.bind(this, "confirmEmail")}
          keyboardType="email-address"
          error={!!credentialsInvalid?.confirmEmail}
          autoComplete="email"
          textContentType="emailAddress"
        />
      )}
      <Input
        label="Password"
        value={authDetails.password}
        secure={secure}
        onUpdateText={handleInputs.bind(this, "password")}
        keyboardType="default"
        error={!!credentialsInvalid?.password}
      >
        <Pressable onPress={() => setSecure(!secure)}>
          <MaterialCommunityIcons
            name={secure ? "eye-outline" : "eye-off-outline"}
            size={24}
            color={theme.muted}
          />
        </Pressable>
      </Input>
      {!isLogin && (
        <Input
          label="Confirm Password"
          value={authDetails.confirmPassword}
          secure={secure2}
          onUpdateText={handleInputs.bind(this, "confirmPassword")}
          keyboardType="default"
          error={!!credentialsInvalid?.confirmPassword}
        >
          <Pressable onPress={() => setSecure2(!secure2)}>
            <MaterialCommunityIcons
              name={secure2 ? "eye-outline" : "eye-off-outline"}
              size={24}
              color={theme.muted}
            />
          </Pressable>
        </Input>
      )}
      <View>
        <PrimaryButton onPress={onSubmitHandler}>
          {isLogin ? "Log In" : "Create Account"}
        </PrimaryButton>
      </View>
      {/* </KeyboardAvoidingView> */}
    </View>
  );
}

export default AuthForm;
