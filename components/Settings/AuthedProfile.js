import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import SubtitleText from "../../components/ui/SubtitleText";
import { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import { useAppTheme } from "../../store/app-theme-context";
import SettingsPressable from "./SettingsPressable";
import ChangePasswordModal from "../../modals/ChangePasswordModal";
import LoadingOverlay from "../ui/LoadingOverlay";
import FlatButton from "../ui/FlatButton";
import { useNavigation } from "@react-navigation/native";
import { updatePassword, deleteUser, unlink } from "firebase/auth";
import { auth } from "../../firebase/app";
import { deleteCurrentUser, updateUser } from "../../firebase/users.db.js";
import AvatarSegment from "../ui/AvatarSegment";
import { useFasting } from "../../store/fastingLogic/fasting-context.js";
import { StatsContext } from "../../store/statsLogic/stats-context.js";
import Title from "../ui/Title.js";
import { usePremium } from "../../hooks/usePremium.js";

function AuthedProfile({ emailAddress }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const authCxt = useContext(AuthContext);
  const { statsLogout } = useContext(StatsContext);
  const navigation = useNavigation();
  const { theme, setThemeName } = useAppTheme();
  const { setSchedule } = useFasting();
  const { isPremium } = usePremium();

  async function logoutHandler() {
    await statsLogout();
    try {
      authCxt.logout();
      setThemeName("Original", true);
      setSchedule(null);
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

  function confirmDeleteAccount() {
    Alert.alert(
      "Delete account?",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete account",
          style: "destructive",
          onPress: deleteHandler,
        },
      ]
    );
  }

  async function deleteHandler() {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const uid = user.uid;
      const providerIds = user.providerData.map((p) => p.providerId);

      await deleteCurrentUser(uid);

      for (const providerId of providerIds) {
        try {
          await unlink(user, providerId);
        } catch (err) {
          console.warn("DELETE UNLINKING ERROR:", err);
          Alert.alert("Delete error. Please contact support.");
        }
      }

      await deleteUser(user);

      Alert.alert(
        "Account deleted",
        "Your account has been deleted successfully.\n\nYou can sign up again at any time using Apple, Google, or email. This will create a brand new account.",
        [
          {
            text: "OK",
            onPress: async () => {
              await statsLogout();
              authCxt.logout();
            },
          },
        ]
      );
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        Alert.alert(
          "Please reauthenticate",
          "For security reasons, please sign in again and retry account deletion."
        );
        await statsLogout();
        authCxt.logout();
        return;
      }

      console.warn("DELETE ERROR:", err);
      Alert.alert("Delete error. Please contact support.");
    }
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
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Please reauthenticate",
          "For security reasons, please sign in again before changing your password."
        );
        return;
      }

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
    return <LoadingOverlay>Please Wait...</LoadingOverlay>;
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
      <View style={styles(theme).container}>
        <View>
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
          <View>
            <SettingsPressable
              label="Email"
              icon="email"
              subtitle={emailAddress}
            />
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
            {isPremium ? (
              <SettingsPressable
                icon="subscriptions"
                label="Manage Subscriptions"
                onPress={() => {
                  Alert.alert(
                    "Subscriptions are managed through the App Store.",
                    "If you wish to cancel your subscription you can do this by selecting the 'App Store' button below.",
                    [
                      {
                        isPreferred: true,
                        style: "cancel",
                        text: "Cancel",
                      },
                      {
                        isPreferred: false,
                        style: "default",
                        text: "App Store",
                        onPress: () => {
                          const url =
                            Platform.OS === "ios"
                              ? "https://apps.apple.com/account/subscriptions"
                              : "https://play.google.com/store/account/subscriptions";

                          Linking.openURL(url);
                        },
                      },
                    ]
                  );
                }}
              />
            ) : null}
          </View>
        </View>
        <View>
          <Title size={20} style={{ paddingLeft: 0, color: theme.error }}>
            Danger Zone
          </Title>
          <View style={styles(theme).divider} />
          <View style={styles(theme).dangerZone}>
            <FlatButton
              size="s"
              onPress={confirmDeleteAccount}
              style={{ textAlign: "left", paddingLeft: 0 }}
            >
              Delete Account
            </FlatButton>
          </View>
        </View>
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
    container: {
      margin: 24,
      flex: 1,
      justifyContent: "space-between",
    },
    dangerZone: {
      alignSelf: "flex-start",
    },
    divider: {
      height: 1,
      backgroundColor: theme.border || theme.secondary200,
      marginBottom: 12,
    },
  });
