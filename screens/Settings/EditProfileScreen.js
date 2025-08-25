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
import AvatarPickerModal from "../../modals/AvatarPickerModal";
import FlatButton from "../../components/ui/FlatButton";

function EditProfileScreen() {
  const [showInputs, setShowInputs] = useState({
    name: false,
    username: false,
  });
  const [openModal, setOpenModal] = useState(false);
  const navigation = useNavigation();
  const authCxt = useContext(AuthContext);
  const [inputDetails, setInputDetails] = useState({
    name: authCxt.fullName || "",
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

      await updateUser(auth.currentUser.uid, {
        displayName: username ? username : auth.currentUser.displayName,
        email: auth.currentUser.email,
        fullName: name ? name : authCxt.fullName,
      });

      authCxt.updateUsername(username);
      authCxt.updateFullName(name);
      navigation.navigate("ProfileScreen", {
        emailAddress: authCxt.emailAddress,
        username: username,
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  async function onAvatarSave(value) {
    try {
      await updateUser(auth.currentUser.uid, {
        avatarId: value,
      });
      authCxt.updateAvatarId(value);
      setOpenModal(false);
    } catch (err) {
      throw new Error(err);
    }
  }

  return (
    <View style={styles.container}>
      <View>
        <AvatarSegment avatarId={authCxt.avatarId} />
        <FlatButton onPress={() => setOpenModal(!openModal)}>
          Edit Avatar
        </FlatButton>
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

      <AvatarPickerModal
        showModal={openModal}
        onRequestClose={() => setOpenModal(!openModal)}
        onSave={onAvatarSave}
      />
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
