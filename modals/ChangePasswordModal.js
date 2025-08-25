import { Modal, StyleSheet, View } from "react-native";
import { useAppTheme } from "../store/app-theme-context";
import { Pressable } from "react-native";
import Input from "../components/Auth/Input";
import PrimaryButton from "../components/ui/PrimaryButton";
import Title from "../components/ui/Title";
import { useState } from "react";

function ChangePasswordModal({ showModal, onRequestClose, onSave }) {
  const { theme } = useAppTheme();
  const [passwordValue, setPasswordValue] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  function handleInputs(type, value) {
    switch (type) {
      case "newPassword":
        setPasswordValue((passwordValue) => ({
          ...passwordValue,
          newPassword: value,
        }));
        break;
      case "confirmNewPassword":
        setPasswordValue((passwordValue) => ({
          ...passwordValue,
          confirmNewPassword: value,
        }));
        break;
    }
  }

  function onSaveHandler() {
    onSave({
      newPassword: passwordValue.newPassword,
      confirmNewPassword: passwordValue.confirmNewPassword,
    });
  }

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <Pressable style={styles(theme).modalBackdrop} onPress={onRequestClose} />
      <View style={styles(theme).modalSheet}>
        <Title>Change Password</Title>
        <Input
          label="New Password"
          secure
          style={{ marginBottom: 0 }}
          value={passwordValue.newPassword}
          onUpdateText={handleInputs.bind(this, "newPassword")}
        />
        <Input
          label="Confirm New Password"
          secure
          value={passwordValue.confirmNewPassword}
          onUpdateText={handleInputs.bind(this, "confirmNewPassword")}
        />
        <PrimaryButton onPress={onSaveHandler}>Save Password</PrimaryButton>
      </View>
    </Modal>
  );
}

export default ChangePasswordModal;

const styles = (theme) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalSheet: {
      backgroundColor: theme.card,
      paddingTop: 16,
      paddingHorizontal: 24,
      paddingBottom: 30,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      alignItems: "stretch",
    },
  });
