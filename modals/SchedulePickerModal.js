import { Modal, Pressable, View, Platform, StyleSheet } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
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

  if (Platform.OS === "android") {
    if (showPicker) {
      DateTimePickerAndroid.open({
        mode: "time",
        value: dateTimeValue,
        is24Hour: false,
        onChange: (event, selectedDate) => {
          if (event.type === "set") {
            onChange(event, selectedDate);
          }
          onRequestClose();
        },
      });
    }
    return null;
  }

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
          onChange={onChange}
          style={{ alignSelf: "center" }}
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
      alignItems: "stretch",
    },
  });
