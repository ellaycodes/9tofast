import AuthContent from "../components/Auth/AuthContent";
import { createUser } from "../util/useAuth";
import { useContext, useState } from "react";
import { AuthContext } from "../store/auth-context";
import LoadingOverlay from "../components/ui/LoadingOverlay";

function SignupScreen({ navigation }) {
  const [isAuthing, setIsAuthing] = useState(false);

  const authCxt = useContext(AuthContext);

  async function signUpHandler(authDetails) {
    setIsAuthing(true);
    try {
      const token = await createUser(authDetails.email, authDetails.password);
      navigation.navigate("OnboardingCarousel", {
        token
      });
    } catch (err) {
      Alert.alert("Authentication Failed", "Could not sign you in!");
      setIsAuthing(false);
    }
  }

  if (isAuthing) {
    return <LoadingOverlay>Signing you in</LoadingOverlay>;
  }

  return <AuthContent authenticate={signUpHandler} />;
}

export default SignupScreen;
