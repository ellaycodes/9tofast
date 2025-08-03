import { Modal, Pressable, View, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import PrimaryButton from "../components/ui/PrimaryButton";
import { useAppTheme } from "../store/app-theme-context";
import { timeStringToDate } from "../util/formatTime";

function SchedulePickerModal({
  showPicker,
  onRequestClose,
  timeDate,
  onChange,
}) {
  const { theme } = useAppTheme();

  const dateTimeValue = timeStringToDate(timeDate);

  return (
    <Modal
      visible={showPicker}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <Pressable style={styles(theme).modalBackdrop} onPress={onRequestClose} />
      <View style={styles(theme).modalSheet}>
        <DateTimePicker
          mode="time"
          value={dateTimeValue}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          textColor={Platform.OS === "ios" ? theme.text : undefined}
          onChange={(e, d) => {
            onChange(e, d);
            if (Platform.OS !== "ios") onRequestClose();
          }}
        />
        <PrimaryButton onPress={onRequestClose}>Done</PrimaryButton>
      </View>
    </Modal>
  );
}

export default SchedulePickerModal;

const styles = (theme) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalSheet: {
      backgroundColor: theme.card,
      padding: 16,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      alignItems: "center",
    },
  });
