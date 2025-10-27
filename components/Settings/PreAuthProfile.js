import { Alert, StyleSheet, View } from "react-native";
import Title from "../../components/ui/Title";
import AuthForm from "../../components/Auth/AuthForm";
import { MaterialIcons } from "@expo/vector-icons";
import SubtitleText from "../../components/ui/SubtitleText";
import { useAppTheme } from "../../store/app-theme-context";
import { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { useNavigation } from "@react-navigation/native";
import {
  EmailAuthProvider,
  getIdToken,
  linkWithCredential,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase/app";

function PreAuthProfile() {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const authCxt = useContext(AuthContext);
  const [isAuthing, setIsAuthing] = useState(false);

  async function createAccount({ email, password }) {
    setIsAuthing(true);
    try {
      const cred = EmailAuthProvider.credential(email, password);
      const userCredential = await linkWithCredential(auth.currentUser, cred);
      const token = await getIdToken(userCredential.user, true);
      await updateProfile(auth.currentUser, { displayName: authCxt.username });

      authCxt.authenticate(token, authCxt.username);
      authCxt.setEmailAddress(email);

      navigation.navigate("TimerScreen");
    } catch (error) {
      const msg =
        error && error.error && error.error.message
          ? error.error.message
          : "Sign up failed";
      Alert.alert("Authentication Failed", msg);
      console.error(error);
      setIsAuthing(false);
    }
  }

  function submitHandler(authDetails) {
    let { email, confirmEmail, password, confirmPassword } = authDetails;

    const emailIsValid = email.includes("@");
    const passwordIsValid = password.length > 6;
    const emailsAreEqual = email === confirmEmail;
    const passwordsAreEqual = password === confirmPassword;

    if (
      !emailIsValid ||
      !passwordIsValid ||
      !emailsAreEqual ||
      !passwordsAreEqual
    ) {
      Alert.alert("Invalid input", "Please check your entered credentials.");
      setCredentialsInvalid({
        email: !emailIsValid,
        confirmEmail: !emailIsValid || !emailsAreEqual,
        password: !passwordIsValid,
        confirmPassword: !passwordIsValid || !passwordsAreEqual,
      });
      return;
    }

    createAccount({ email, password });
  }

  if (isAuthing) {
    return <LoadingOverlay>Creating Account</LoadingOverlay>;
  }

  return (
    <View style={styles(theme).containter}>
      <View style={styles(theme).profilePicContainer}>
        <MaterialIcons name="person-outline" size={100} color={theme.muted} />
      </View>
      <Title size={20} style={{ paddingBottom: 0, marginBottom: 0 }}>
        Create An Account
      </Title>
      <SubtitleText muted style={{ paddingTop: 0, marginTop: 2 }} size="l">
        {authCxt.username}
      </SubtitleText>
      <AuthForm onSubmit={submitHandler} />
    </View>
  );
}

export default PreAuthProfile;

const styles = (theme) =>
  StyleSheet.create({
    containter: {
      margin: 20,
    },
    profilePicContainer: {
      borderRadius: 70,
      backgroundColor: theme.secondary100,
      alignSelf: "center",
      padding: 20,
    },
  });
