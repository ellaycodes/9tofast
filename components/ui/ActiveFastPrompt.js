import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import PrimaryButton from "./PrimaryButton";

/**
 * Shown when the user saves a schedule change that affects today's config
 * while a fast is in progress.
 */
export default function ActiveFastPrompt({ visible, onStartTomorrow, onApplyNow, onClose }) {
  const { theme } = useAppTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles(theme).backdrop} onPress={onClose} />
      <View style={styles(theme).container}>
        <Text style={styles(theme).title}>Apply changes to today's fast?</Text>
        <Text style={styles(theme).body}>
          You have a fast in progress. Do you want to apply your new schedule to
          today, or keep today's fast as-is and start the new schedule tomorrow?
        </Text>
        <PrimaryButton onPress={onStartTomorrow} style={{ marginTop: 8 }}>
          Start tomorrow
        </PrimaryButton>
        <PrimaryButton lowlight onPress={onApplyNow}>
          Apply now
        </PrimaryButton>
      </View>
    </Modal>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
      backgroundColor: theme.card,
      margin: 24,
      borderRadius: 20,
      padding: 24,
      position: "absolute",
      left: 0,
      right: 0,
      bottom: "20%",
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 10,
      textAlign: "center",
    },
    body: {
      color: theme.muted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      marginBottom: 8,
    },
  });
