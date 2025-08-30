import { useContext, useState } from "react";
import AuthContent from "../../components/Auth/AuthContent";
import { AuthContext } from "../../store/auth-context";
import { Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { Platform } from "react-native";
import { updateUser, getUser } from "../../firebase/users.db.js";
import { getPreferences } from "../../firebase/fasting.db.js";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { auth } from "../../firebase/app";
import { getIdToken, signInWithEmailAndPassword } from "firebase/auth";

function LoginScreen() {
  const [isAuthing, setIsAuthing] = useState(false);

  const authCxt = useContext(AuthContext);
  const { setSchedule } = useFasting();

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
        displayName: displayName,
        email: email,
      };

      await updateUser(uid, args);

      const token = await getIdToken(user, true);

      authCxt.authenticate(token, displayName, uid);
      authCxt.setEmailAddress(email);
      authCxt.setOnboarded(true);

      const [userData, prefs] = await Promise.all([
        getUser(uid),
        getPreferences(uid),
      ]);
      if (userData?.fullName) authCxt.updateFullName(userData.fullName);
      if (userData?.avatarId) authCxt.updateAvatarId(userData.avatarId);
      if (prefs?.fastingSchedule) setSchedule(prefs.fastingSchedule);
    } catch (error) {
      Alert.alert("Authentication Failed", error.message);
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
