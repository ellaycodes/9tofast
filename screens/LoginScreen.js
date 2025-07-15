import { login } from "../util/useAuth";
import { useContext, useState } from "react";
import AuthContent from "../components/Auth/AuthContent";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../store/auth-context";
import { Alert } from "react-native";
import LoadingOverlay from "../components/ui/LoadingOverlay";

function LoginScreen() {
  const [isAuthing, setIsAuthing] = useState(false);

  const authCxt = useContext(AuthContext);

  async function loginHandler(authDetails) {
    setIsAuthing(true);
    try {
      const token = await login(authDetails.email, authDetails.password);
      authCxt.authenticate(token);
    } catch (err) {
      Alert.alert("Authentication Failed", "Could not log you in!");
      setIsAuthing(false);
    }
  }

  if (isAuthing) {
    return <LoadingOverlay>Logging you in</LoadingOverlay>;
  }

  return (
    <SafeAreaView>
      <AuthContent isLogin authenticate={loginHandler} />
    </SafeAreaView>
  );
}

export default LoginScreen;
