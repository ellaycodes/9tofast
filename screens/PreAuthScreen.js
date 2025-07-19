import { StyleSheet, View } from "react-native";
import Title from "../components/ui/Title";
import PrimaryButton from "../components/ui/PrimaryButton";
import SubtitleText from "../components/ui/SubtitleText";
import FlatButton from "../components/ui/FlatButton";

function PreAuthScreen({ navigation }) {
  function termsOfServiceHandler() {
    console.log("Hi! I want to see the terms of service");
  }

   function privacyPolicyHandler() {
    console.log("Hi! I want to see the privacy policy");
  }

  function emailHandler() {
    navigation.navigate("LoginScreen");
  }

  function googleHandler() {
    
  }

  return (
    <View>
      <Title>Welcome to 9ToFast</Title>;
      <SubtitleText size={"xl"}>
        Track your Intermittent Fasting Schedule and stay on top of your health
        goals.
      </SubtitleText>
      <View style={styles.buttonContainer}>
        <PrimaryButton onPress={googleHandler}>
          Continue with Google
        </PrimaryButton>
        <PrimaryButton lowlight>Continue with Apple</PrimaryButton>
        <PrimaryButton lowlight onPress={emailHandler}>
          Continue with Email
        </PrimaryButton>
        {/* <PrimaryButton lowlight >Continue without signing up</PrimaryButton> */}
        <FlatButton>Continue without signing up</FlatButton>
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
