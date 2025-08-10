import AuthContent from "../../components/Auth/AuthContent";
import { createUser } from "../../util/useAuth";
import { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { Platform } from "react-native";
import randomUsername from "../../util/randomUsername";

function SignupScreen({ navigation }) {
  const [isAuthing, setIsAuthing] = useState(false);

  const authCxt = useContext(AuthContext);

  async function signUpHandler(authDetails) {
    setIsAuthing(true);
    try {
      const { token, refreshToken } = await createUser(
        authDetails.email,
        authDetails.password
      );
      const userName = randomUsername();
      navigation.navigate("OnboardingCarousel", {
        token,
        refreshToken,
        userName
      });
    } catch (err) {
      Alert.alert("Authentication Failed", "Could not sign you in!");
      setIsAuthing(false);
    }
  }

  if (isAuthing) {
    return <LoadingOverlay>Signing you in</LoadingOverlay>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthContent authenticate={signUpHandler} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default SignupScreen;
