import { Alert, ScrollView, StyleSheet, View } from "react-native";
import SubtitleText from "../../components/ui/SubtitleText";
import { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import { useAppTheme } from "../../store/app-theme-context";
import SettingsPressable from "./SettingsPressable";
import ChangePasswordModal from "../../modals/ChangePasswordModal";
import LoadingOverlay from "../ui/LoadingOverlay";
import FlatButton from "../ui/FlatButton";
import { useNavigation } from "@react-navigation/native";
import { updatePassword, deleteUser } from "firebase/auth";
import { auth } from "../../firebase/app";
import { deleteCurrentUser } from "../../firebase/users.db.js";
import AvatarSegment from "../ui/AvatarSegment";

function AuthedProfile({ emailAddress }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const authCxt = useContext(AuthContext);
  const navigation = useNavigation();
  const { theme } = useAppTheme();

  async function logoutHandler() {
    try {
      return authCxt.logout();
    } catch (error) {
      const message =
        error &&
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.message
          ? error.response.data.error.message
          : error && error.message
          ? error.message
          : "Something went wrong.";
      console.error(error);
      Alert.alert("Error", message);
    }
  }

  function deleteHandler() {
    deleteUser(auth.currentUser);
    deleteCurrentUser();
    authCxt.isAuthed = false;
  }

  async function changePasswordHandler(password) {
    const passwordIsValid = password.newPassword.length > 6;
    const passwordsAreEqual =
      password.newPassword === password.confirmNewPassword;

    setLoading(true);
    try {
      if (!passwordIsValid)
        throw new Error("Password must be at least 7 characters.");
      if (!passwordsAreEqual) throw new Error("Passwords do not match.");
      const user = auth.currentUser;

      const res = await updatePassword(user, password.newPassword);

      setShowModal(false);
      Alert.alert("Success", "Password updated.");
    } catch (error) {
      const message =
        error &&
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.message
          ? error.response.data.error.message
          : error && error.message
          ? error.message
          : "Something went wrong.";
      console.error(error);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  function modalToggle(toggle) {
    toggle === "close" ? setShowModal(false) : setShowModal(true);
  }

  if (loading) {
    return <LoadingOverlay>Changing Password</LoadingOverlay>;
  }

  return (
    <ScrollView>
      <View>
        <AvatarSegment small={false} avatarId={authCxt.avatarId} />
        <SubtitleText muted style={{ marginTop: 2 }} size="m">
          {authCxt.username}
        </SubtitleText>
        <FlatButton
          onPress={() => navigation.navigate("EditProfileScreen")}
          style={{ padding: 0, margin: 0 }}
        >
          Edit Profile
        </FlatButton>
      </View>
      <View style={styles(theme).profileInfoContainer}>
        <SettingsPressable label="Email" icon="email" subtitle={emailAddress} />
        <SettingsPressable
          icon="password"
          onPress={() => modalToggle("open")}
          label="Change Password"
        />
        <SettingsPressable
          icon="logout"
          onPress={logoutHandler}
          label="Logout"
        />
        <SettingsPressable
          icon="delete"
          onPress={deleteHandler}
          label="Delete Account"
          iconColour={theme.error}
        />
      </View>

      <ChangePasswordModal
        showModal={showModal}
        onRequestClose={() => modalToggle("close")}
        onSave={changePasswordHandler}
      />
    </ScrollView>
  );
}

export default AuthedProfile;

const styles = (theme) =>
  StyleSheet.create({
    profilePicContainer: {
      borderRadius: 70,
      backgroundColor: theme.secondary100,
      alignSelf: "center",
      padding: 20,
      marginTop: 24,
    },
    profileInfoContainer: {
      margin: 24,
    },
  });
