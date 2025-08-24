import AuthContent from "../../components/Auth/AuthContent";
import { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { Platform } from "react-native";
import randomUsername from "../../util/randomUsername";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/app";
import { addUser } from "../../firebase/db";

function SignupScreen({ navigation }) {
  const [isAuthing, setIsAuthing] = useState(false);

  const authCxt = useContext(AuthContext);

  async function signUpHandler(authDetails) {
    setIsAuthing(true);
    try {
      const userName = randomUsername();

      const { user } = await createUserWithEmailAndPassword(
        auth,
        authDetails.email,
        authDetails.password
      );

      await addUser({
        uid: user.uid,
        email: authDetails.email,
        displayName: userName,
      });

      navigation.navigate("OnboardingCarousel", {
        token: user.stsTokenManager.accessToken,
        userName: userName,
        localId: user.uid,
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
