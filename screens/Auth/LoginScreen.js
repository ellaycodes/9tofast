import { useContext, useState } from "react";
import AuthContent from "../../components/Auth/AuthContent";
import { AuthContext } from "../../store/auth-context";
import { Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { Platform } from "react-native";
import { updateUser } from "../../firebase/db";
import { auth } from "../../firebase/app";
import { getIdToken, signInWithEmailAndPassword } from "firebase/auth";

function LoginScreen() {
  const [isAuthing, setIsAuthing] = useState(false);

  const authCxt = useContext(AuthContext);

  async function loginHandler(authDetails) {
    setIsAuthing(true);
    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        authDetails.email,
        authDetails.password
      );

      const { displayName, email, uid } = user;

      const args = {
        uid: uid,
        displayName: displayName,
        email: email
      };

      await updateUser(args);

      const token = await getIdToken(user, true);

      authCxt.authenticate(token, displayName, uid);
      authCxt.setEmailAddress(email);
    } catch (err) {
      console.log(err);

      Alert.alert("Authentication Failed", "Could not log you in!");
      setIsAuthing(false);
    }
  }

  if (isAuthing) {
    return <LoadingOverlay>Logging you in</LoadingOverlay>;
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
        <AuthContent isLogin authenticate={loginHandler} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;
