import { StyleSheet } from "react-native";
import PreAuthProfile from "../../components/Settings/PreAuthProfile";
import AuthedProfile from "../../components/Settings/AuthedProfile";

function ProfileScreen({ route }) {
  const { emailAddress } = route.params;
  return emailAddress ? (
    <AuthedProfile emailAddress={emailAddress} />
  ) : (
    <PreAuthProfile />
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
