import { Modal, Pressable, StyleSheet, View, Text } from "react-native";
import { useAppTheme } from "../store/app-theme-context";
import Title from "../components/ui/Title";
import SubtitleText from "../components/ui/SubtitleText";
import PrimaryButton from "../components/ui/PrimaryButton";

export default function OverrideStreakModal({
  showModal,
  onRequestClose,
  onSave,
}) {
  const { theme } = useAppTheme();
  return (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <Pressable style={styles(theme).container} onPress={onRequestClose}>
        <View
          style={styles(theme).modalSheet}
          onStartShouldSetResponder={() => true}
        >
          <Title size='26' style={{ paddingBottom: 0 }}>Override Streak?</Title>
          <SubtitleText size='s' style={{lineHeight: 18}}>
            This action will manually keep your current streak and will update your stats. This cannot be undone. You can only override once every 30 days.{" "}
          </SubtitleText>
          <View style={styles(theme).buttonContainer}>
            <PrimaryButton
              lowlight
              onPress={onRequestClose}
              style={styles(theme).button}
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton onPress={onSave} style={styles(theme).button}>
              Confirm
            </PrimaryButton>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalSheet: {
      backgroundColor: theme.card,
      paddingTop: 16,
      paddingHorizontal: 24,
      paddingBottom: 30,
      borderRadius: 24,
      alignItems: "center",
      width: "80%",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    button: {
      width: "50%",
    },
  });
