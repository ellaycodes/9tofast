import { useContext, useState } from "react";
import AuthContent from "../../components/Auth/AuthContent";
import { AuthContext } from "../../store/auth-context";
import { Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { Platform } from "react-native";
import { getUser } from "../../firebase/users.db.js";
import { getPreferences } from "../../firebase/fasting.db.js";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { auth } from "../../firebase/app";
import { getIdToken, signInWithEmailAndPassword } from "firebase/auth";
import { usePremium } from "../../store/premium-context.js";

function LoginScreen() {
  const [isAuthing, setIsAuthing] = useState(false);

  const authCxt = useContext(AuthContext);
  const { premiumLogIn } = usePremium();
  const { setSchedule } = useFasting();

  async function loginHandler(authDetails) {
    setIsAuthing(true);
    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        authDetails.email,
        authDetails.password
      );

      const uid = user.uid;

      const [userData, prefs, token] = await Promise.all([
        getUser(uid),
        getPreferences(uid),
        getIdToken(user, true),
      ]);

      const displayName = userData?.displayName ?? "";

      authCxt.authenticate(token, displayName, uid);
      authCxt.setEmailAddress(userData.email);
      authCxt.setOnboarded(true);

      await premiumLogIn(user.uid);

      if (userData && userData.fullName) {
        authCxt.updateFullName(userData.fullName);
      }
      if (userData && userData.avatarId) {
        authCxt.updateAvatarId(userData.avatarId);
      }
      if (prefs && prefs.fastingSchedule) {
        await setSchedule(prefs.fastingSchedule, { anchor: false });
      }
    } catch (error) {
      Alert.alert(
        "Oh no! Could not log you in.",
        "Please ensure you have the correct username & password. If you have forgotten your password, please use the 'Forgotten Password' link."
      );
      setIsAuthing(false);
      throw error;
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
