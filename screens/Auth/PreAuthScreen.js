import { StyleSheet, View, Linking, Alert, Platform } from "react-native";
import { useEffect, useState, useCallback } from "react";

import Title from "../../components/ui/Title";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SubtitleText from "../../components/ui/SubtitleText";
import FlatButton from "../../components/ui/FlatButton";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithCredential,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase/app";
import { getUser } from "../../firebase/users.db.js";

import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { useFasting } from "../../store/fastingLogic/fasting-context.js";
import useGoogleAuth from "../../hooks/useGoogleAuth.js";
import * as AppleAuthentication from "expo-apple-authentication";
import useAuthHelpers from "../../hooks/useAuthHelpers.js";
import { usePremium } from "../../store/premium-context.js";

WebBrowser.maybeCompleteAuthSession();

function PreAuthScreen({ navigation }) {
  const [isAuthing, setIsAuthing] = useState(false);
  const { setSchedule } = useFasting();
  const { premiumLogIn } = usePremium();
  const {
    handleExistingUserLogin,
    handleNewProviderUser,
    handleNewAnonymousUser,
  } = useAuthHelpers();

  const { request, response, signIn } = useGoogleAuth();

  useEffect(() => {
    if (Platform.OS === "android") return;

    const signInWithGoogle = async () => {
      if (response?.type === "success") {
        setIsAuthing(true);
        try {
          const { id_token } = response.params;
          const credential = GoogleAuthProvider.credential(id_token);

          const { user } = await signInWithCredential(auth, credential);
          const existingUser = await getUser(user.uid);

          if (!existingUser) {
            await handleNewProviderUser(
              user,
              user.email,
              user.displayName,
              navigation
            );
            return;
          }
          await handleExistingUserLogin(user, existingUser);
          await premiumLogIn(user.uid);
        } catch (err) {
          Alert.alert(
            "There was an error while logging you in",
            "Please contact support if this continues"
          );
          setIsAuthing(false);
        } finally {
          setIsAuthing(false);
        }
      }
    };
    signInWithGoogle();
  }, [
    response,
    navigation,
    premiumLogIn,
    handleExistingUserLogin,
    handleNewProviderUser,
  ]);

  function emailHandler() {
    navigation.navigate("LoginScreen");
  }

  async function signInAnonymouslyHandler() {
    setIsAuthing(true);
    try {
      const { user } = await signInAnonymously(auth);
      await handleNewAnonymousUser(user, navigation);
    } catch (error) {
      Alert.alert(
        "There was an error signing you in",
        "Please try again or contact support if the issue persists."
      );
      setIsAuthing(false);
    } finally {
      setIsAuthing(false);
    }
  }

  async function googleHandler() {
    setIsAuthing(true);
    try {
      const result = await signIn();
      if (Platform.OS === "android" && result?.uid) {
        const user = result;
        const existingUser = await getUser(user.uid);

        if (!existingUser) {
          await handleNewProviderUser(
            user,
            user.email,
            user.displayName,
            navigation
          );
          return;
        }
        await handleExistingUserLogin(user, existingUser);
        await premiumLogIn(user.uid);
      }
    } catch (err) {
      if (err?.code === "ERR_REQUEST_CANCELED") return;
      console.log(err.code);

      Alert.alert(
        "There was an error while logging you in",
        "Please try again or contact support if this issue persists."
      );
    } finally {
      setIsAuthing(false);
    }
  }

  async function appleHandler() {
    setIsAuthing(true);
    try {
      const appleResult = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const provider = new OAuthProvider("apple.com");

      const credential = provider.credential({
        idToken: appleResult.identityToken,
      });

      const { user } = await signInWithCredential(auth, credential);

      const fullName =
        appleResult.fullName?.givenName && appleResult.fullName?.familyName
          ? `${appleResult.fullName.givenName} ${appleResult.fullName.familyName}`
          : null;

      const email = appleResult.email || user.email;

      const existing = await getUser(user.uid);

      if (!existing) {
        await handleNewProviderUser(user, email, fullName, navigation);
        return;
      }
      await handleExistingUserLogin(user, existing);
      await premiumLogIn(user.uid);
    } catch (err) {
      setIsAuthing(false);
      if (err.code === "ERR_REQUEST_CANCELED") return;
      console.warn("APPLE ERROR HERE =>", err);
      Alert.alert(
        "There was an error signing you in with Apple.",
        // err.code
        "Please try signing in a different way or contact support if the issue persists."
      );
    } finally {
      setIsAuthing(false);
    }
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
        {Platform.OS === "android" ? null : (
          <PrimaryButton
            onPress={appleHandler}
            style={{ backgroundColor: "white" }}
          >
            <Ionicons name="logo-apple" size={24} color="black" />
            <View style={{ width: 8 }} />
            Continue with Apple
          </PrimaryButton>
        )}
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
