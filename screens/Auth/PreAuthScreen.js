import { StyleSheet, View } from "react-native";
import Title from "../../components/ui/Title";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SubtitleText from "../../components/ui/SubtitleText";
import FlatButton from "../../components/ui/FlatButton";
import { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import { anonymousUser } from "../../util/useAuth";
import { Alert } from "react-native";
import LoadingOverlay from "../../components/ui/LoadingOverlay";

function PreAuthScreen({ navigation }) {
  const [isAuthing, setIsAuthing] = useState();

  const authCxt = useContext(AuthContext);

  function termsOfServiceHandler() {
    console.log("Hi! I want to see the terms of service");
  }

  function privacyPolicyHandler() {
    console.log("Hi! I want to see the privacy policy");
  }

  function emailHandler() {
    navigation.navigate("LoginScreen");
  }

  async function signInAnonymouslyHandler() {
    setIsAuthing(true);
    try {
      const token = await anonymousUser();
      navigation.navigate("OnboardingCarousel", {
        token,
      });
    } catch (err) {
      Alert.alert("Authentication Failed", "Could not log you in!");
      setIsAuthing(false);
    }
  }

  if (isAuthing) {
    return <LoadingOverlay>Logging you in</LoadingOverlay>;
  }

  return (
    <View>
      <Title>Welcome to 9ToFast</Title>
      <SubtitleText size={"xl"}>
        Track your Intermittent Fasting Schedule and stay on top of your health
        goals.
      </SubtitleText>
      <View style={styles.buttonContainer}>
        <PrimaryButton onPress={emailHandler}>
          Continue with Email
        </PrimaryButton>
        <PrimaryButton lowlight onPress={signInAnonymouslyHandler}>
          Continue without signing up
        </PrimaryButton>
      </View>
      <SubtitleText size={"m"} muted>
        By continuing, you agree to our{" "}
        <FlatButton inline onPress={termsOfServiceHandler} size={"m"}>
          Terms of Service{" "}
        </FlatButton>
        and{" "}
        <FlatButton inline size={"m"} onPress={privacyPolicyHandler}>
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
});
