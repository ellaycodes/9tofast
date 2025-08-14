import { getAccountInfo, login } from "../../util/useAuth";
import { useContext, useState } from "react";
import AuthContent from "../../components/Auth/AuthContent";
import { AuthContext } from "../../store/auth-context";
import { Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { Platform } from "react-native";

function LoginScreen() {
  const [isAuthing, setIsAuthing] = useState(false);

  const authCxt = useContext(AuthContext);

  async function loginHandler(authDetails) {
    setIsAuthing(true);
    try {
      const { token, refreshToken } = await login(
        authDetails.email,
        authDetails.password
      );
      const res = await getAccountInfo(token);
      const username = res.data.users[0].displayName;
      const emailAddress = res.data.users[0].email;

      authCxt.authenticate(token, refreshToken, username);
      authCxt.anonymousUser(emailAddress);
    } catch (err) {
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
