import { StyleSheet, View, Linking, Alert } from "react-native";
import { useContext, useEffect, useState } from "react";

import Title from "../../components/ui/Title";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SubtitleText from "../../components/ui/SubtitleText";
import FlatButton from "../../components/ui/FlatButton";
import { AuthContext } from "../../store/auth-context";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import randomUsername from "../../util/randomUsername";
import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithCredential,
  getIdToken,
} from "firebase/auth";
import { auth } from "../../firebase/app";
import { addUser, getUser } from "../../firebase/users.db.js";

import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { getPreferences } from "../../firebase/fasting.db.js";
import { useFasting } from "../../store/fastingLogic/fasting-context.js";
import useGoogleAuth from "../../hooks/useGoogleAuth.js";

WebBrowser.maybeCompleteAuthSession();

function PreAuthScreen({ navigation }) {
  const [isAuthing, setIsAuthing] = useState();
  const authCxt = useContext(AuthContext);
  const { setSchedule } = useFasting();

  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    const signInWithGoogle = async () => {
      if (response?.type === "success") {
        setIsAuthing(true);

        try {
          const { id_token } = response.params;
          const credential = GoogleAuthProvider.credential(id_token);

          const { user } = await signInWithCredential(auth, credential);

          const existingUser = await getUser(user.uid);

          if (!existingUser) {
            const userName = randomUsername();

            await addUser({
              uid: user.uid,
              email: user.email,
              displayName: userName,
              isAnonymous: false,
              fullName: user.displayName,
            });

            authCxt.setEmailAddress(user.email);
            authCxt.updateFullName(user.displayName);

            navigation.navigate("OnboardingCarousel", {
              token: user.stsTokenManager.accessToken,
              userName: userName,
              localId: user.uid,
            });
          } else {
            const token = await getIdToken(user, true);

            const prefs = await getPreferences(user.uid);

            authCxt.authenticate(token, existingUser.displayName, user.uid);
            authCxt.setEmailAddress(existingUser.email);
            authCxt.setOnboarded(true);
            authCxt.updateFullName(existingUser.fullName);

            if (existingUser.avatarId) {
              authCxt.updateAvatarId(existingUser.avatarId);
            }
            
            if (prefs && prefs.fastingSchedule) {
              setSchedule(prefs.fastingSchedule);
            }
          }
        } catch (err) {
          Alert.alert("Google sign in failed: Please contact support");
          setIsAuthing(false);
        }
      }
    };
    signInWithGoogle();
  }, [response]);

  function emailHandler() {
    navigation.navigate("LoginScreen");
  }

  async function signInAnonymouslyHandler() {
    setIsAuthing(true);
    try {
      const { user } = await signInAnonymously(auth);
      const userName = randomUsername();
      await addUser({
        uid: user.uid,
        email: null,
        displayName: userName,
        isAnonymous: true,
      });

      navigation.navigate("OnboardingCarousel", {
        token: user.stsTokenManager.accessToken,
        userName: userName,
        localId: user.uid,
      });
    } catch (error) {
      Alert.alert("Authentication Failed", `Could not log you in! ${error}`);
      setIsAuthing(false);
    }
  }

  async function googleHandler() {
    await promptAsync();
  }

  function appleHandler() {
    console.log("Todo");
  }

  if (isAuthing) {
    return <LoadingOverlay>Logging you in</LoadingOverlay>;
  }

  return (
    <View style={styles.container}>
      <Title>Welcome to 9ToFast</Title>
      <SubtitleText size={"xl"}>
        Track your Intermittent Fasting Schedule and stay on top of your health
        goals.
      </SubtitleText>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          onPress={googleHandler}
          style={{ backgroundColor: "white" }}
        >
          <Ionicons name="logo-google" size={24} color="black" />
          <View style={{ width: 8 }} />
          Continue with Google
        </PrimaryButton>
        <PrimaryButton
          onPress={appleHandler}
          style={{ backgroundColor: "white" }}
        >
          <Ionicons name="logo-apple" size={24} color="black" />
          <View style={{ width: 8 }} />
          Continue with Apple
        </PrimaryButton>
        <PrimaryButton onPress={emailHandler}>
          <Ionicons name="mail" size={24} color="black" />
          <View style={{ width: 12 }} />
          Continue with Email
        </PrimaryButton>
        <PrimaryButton lowlight onPress={signInAnonymouslyHandler}>
          Continue without signing up
        </PrimaryButton>
      </View>
      <SubtitleText size={"m"} muted>
        By continuing, you agree to our{" "}
        <FlatButton
          inline
          onPress={() => Linking.openURL("https://9tofast.netlify.app/terms")}
          size={"m"}
        >
          Terms of Service{" "}
        </FlatButton>
        and{" "}
        <FlatButton
          inline
          size={"m"}
          onPress={() => Linking.openURL("https://9tofast.netlify.app/privacy")}
        >
          Privacy Policy
        </FlatButton>
      </SubtitleText>
    </View>
  );
}

export default PreAuthScreen;

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 16,
  },
  container: {
    padding: 12,
  },
});
