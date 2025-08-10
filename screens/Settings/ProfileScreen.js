import { StyleSheet, Text, View } from "react-native";
import Title from "../../components/ui/Title";
import AuthForm from "../../components/Auth/AuthForm";
import { MaterialIcons } from "@expo/vector-icons";
import SubtitleText from "../../components/ui/SubtitleText";
import { useAppTheme } from "../../store/app-theme-context";
import { useContext } from "react";
import { AuthContext } from "../../store/auth-context";

function ProfileScreen({ route }) {
  const { emailAddress } = route.params;
  const { theme } = useAppTheme();
  const authCxt = useContext(AuthContext);

  function submitHandler(authDetails) {
    let { email, confirmEmail, password, confirmPassword } = authDetails;

    const emailIsValid = email.includes("@");
    const passwordIsValid = password.length > 6;
    const emailsAreEqual = email === confirmEmail;
    const passwordsAreEqual = password === confirmPassword;

    if (
      !emailIsValid ||
      !passwordIsValid ||
      ((!emailsAreEqual || !passwordsAreEqual))
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
    
    authCxt.authenticate({ email, password });
  }

  return (
    <View style={styles(theme).containter}>
      {emailAddress ? (
        <View>
          <Title>{emailAddress}</Title>
        </View>
      ) : (
        <View>
          <View style={styles(theme).profilePicContainer}>
            <MaterialIcons
              name="person-outline"
              size={100}
              color={theme.muted}
            />
          </View>
          <Title style={{ fontSize: 20, paddingBottom: 0, marginBottom: 0 }}>
            Create An Account
          </Title>
          <SubtitleText muted style={{ paddingTop: 0, marginTop: 2 }} size="l">
            {authCxt.username}
          </SubtitleText>
          <AuthForm onSubmit={submitHandler} />
        </View>
      )}
    </View>
  );
}

export default ProfileScreen;

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
