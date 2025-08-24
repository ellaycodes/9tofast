import { StyleSheet, View } from "react-native";
import AvatarSegment from "../../components/ui/AvatarSegment";
import { AuthContext } from "../../store/auth-context";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState } from "react";
import SubtitleText from "../../components/ui/SubtitleText";
import SettingsRow from "../../components/Settings/SettingsRow";
import PrimaryButton from "../../components/ui/PrimaryButton";
import Input from "../../components/Auth/Input";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/app";
import { updateUser } from "../../firebase/db";

function EditProfileScreen() {
  const [showInputs, setShowInputs] = useState({
    name: false,
    username: false,
  });
  const navigation = useNavigation();
  const authCxt = useContext(AuthContext);
  const [inputDetails, setInputDetails] = useState({
    name: "",
    username: authCxt.username || "",
  });

  function updateDetails(type, value) {
    switch (type) {
      case "name":
        setInputDetails((inputDetails) => ({
          ...inputDetails,
          name: value,
        }));
        break;
      case "username":
        setInputDetails((inputDetails) => ({
          ...inputDetails,
          username: value,
        }));
    }
  }

  async function handleOnSubmit() {
    const { name, username } = inputDetails;
    try {
      await updateProfile(auth.currentUser, {
        displayName: username,
      });

      await updateUser({
        uid: auth.currentUser.uid,
        displayName: username ? username : auth.currentUser.displayName,
        email: auth.currentUser.email,
        fullName: name ? name : null,
      });

      authCxt.updateUsername(username);
      authCxt.updateFullName(name);
      navigation.navigate("ProfileScreen", {
        emailAddress: authCxt.emailAddress,
        username: username,
      });
    } catch (err) {
      console.log("submit error - AvatarSegment => handleOnSubmit", err);
    }
  }
  return (
    <View style={styles.container}>
      <View>
        <AvatarSegment />
        <View>
          <SubtitleText
            muted
            size="m"
            style={{ alignItems: "flex-start", paddingLeft: 0 }}
          >
            About you
          </SubtitleText>

          <View>
            <SettingsRow
              label="Name"
              onPress={() =>
                setShowInputs((showInputs) => ({
                  ...showInputs,
                  name: !showInputs.name,
                }))
              }
              right={authCxt.fullName ? authCxt.fullName : "Add"}
              open={showInputs.name}
            />
            {showInputs.name && (
              <Input
                label="Edit Name"
                onUpdateText={updateDetails.bind(this, "name")}
                value={inputDetails.name}
              />
            )}
          </View>

          <View>
            <SettingsRow
              label="Username"
              onPress={() =>
                setShowInputs((showInputs) => ({
                  ...showInputs,
                  username: !showInputs.username,
                }))
              }
              right={
                auth.currentUser.displayName
                  ? auth.currentUser.displayName
                  : "Add"
              }
              open={showInputs.username}
            />
            {showInputs.username && (
              <Input
                label="Change Username"
                onUpdateText={updateDetails.bind(this, "username")}
                value={inputDetails.username}
              />
            )}
          </View>
        </View>
      </View>

      <PrimaryButton onPress={handleOnSubmit}>Save</PrimaryButton>
    </View>
  );
}

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    margin: 20,
    flex: 1,
    gap: 40,
    justifyContent: "space-between",
  },
});
