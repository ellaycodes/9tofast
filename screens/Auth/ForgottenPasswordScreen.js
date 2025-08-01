import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../components/Auth/Input";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { Alert, StyleSheet, View } from "react-native";
import { useState } from "react";
import { forgottenPassword } from "../../util/useAuth";
import LoadingOverlay from "../../components/ui/LoadingOverlay";

function ForgottenPassword({ navigation }) {
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submitHandler() {
    setLoading(true);
    try {
      const res = await forgottenPassword(emailAddress);
      setEmailSent(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      Alert.alert(
        "Could not send reset password email!",
        "Check the email address entered and try again."
      );
    }
  }

  function handleInput(value) {
    setEmailAddress(value);
  }

  if (loading) {
    return <LoadingOverlay>Sending Email</LoadingOverlay>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {emailSent ? (
        <View>
          <Title>Email Sent!</Title>
          <SubtitleText>
            Your password reset email has been sent! Be sure to check your
            spam/promotions/updates folder!
          </SubtitleText>
          <PrimaryButton onPress={() => navigation.navigate("LoginScreen")}>
            Back to Login
          </PrimaryButton>
        </View>
      ) : (
        <>
          <View>
            <Title>Forgotten Password</Title>
            <SubtitleText size="l">
              If we have your email address we will send you a reset email
              containing a reset code.
            </SubtitleText>
          </View>
          <View>
            <Input
              label="Email Address"
              value={emailAddress}
              onUpdateText={handleInput}
            />
            <PrimaryButton onPress={submitHandler}>Submit</PrimaryButton>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

export default ForgottenPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    marginHorizontal: 24,
  },
});
