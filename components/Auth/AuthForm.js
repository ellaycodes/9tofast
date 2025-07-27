import { useState } from "react";
import { View } from "react-native";
import Input from "./Input";
import PrimaryButton from "../ui/PrimaryButton";

function AuthForm({ isLogin, onSubmit }) {
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
      <View>
        <Input
          label="Email"
          value={authDetails.email}
          secure={false}
          onUpdateText={handleInputs.bind(this, "email")}
          keyboardType="email-address"
        />
        {!isLogin && (
          <Input
            label="Confirm Email"
            value={authDetails.confirmEmail}
            secure={false}
            onUpdateText={handleInputs.bind(this, "confirmEmail")}
            keyboardType="email-address"
          />
        )}
        <Input
          label="Password"
          value={authDetails.password}
          secure={true}
          onUpdateText={handleInputs.bind(this, "password")}
        />
        {!isLogin && (
          <Input
            label="Confirm Password"
            value={authDetails.confirmPassword}
            secure={true}
            onUpdateText={handleInputs.bind(this, "confirmPassword")}
          />
        )}
        <View>
          <PrimaryButton onPress={onSubmitHandler}>
            {isLogin ? "Log In" : "Sign Up"}
          </PrimaryButton>
        </View>
      </View>
    </View>
  );
}

export default AuthForm;
