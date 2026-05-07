import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../store/app-theme-context";
import PrimaryButton from "./PrimaryButton";
import { DAY_KEYS } from "../../store/fastingLogic/data/weekly-schedule";

const DAY_FULL = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function CopyToModal({ visible, sourceDayKey, onApply, onClose }) {
  const { theme } = useAppTheme();
  const [selected, setSelected] = useState([]);

  const otherDays = DAY_KEYS.filter((k) => k !== sourceDayKey);

  function toggleDay(key) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleApply() {
    onApply(selected);
    setSelected([]);
    onClose();
  }

  function handleClose() {
    setSelected([]);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles(theme).backdrop} onPress={handleClose} />
      <View style={styles(theme).sheet}>
        <Text style={styles(theme).title}>Copy to...</Text>
        {otherDays.map((dayKey) => (
          <Pressable
            key={dayKey}
            style={styles(theme).dayRow}
            onPress={() => toggleDay(dayKey)}
          >
            <Text style={styles(theme).dayLabel}>{DAY_FULL[dayKey]}</Text>
            {selected.includes(dayKey) && (
              <MaterialIcons name="check" size={20} color={theme.success} />
            )}
          </Pressable>
        ))}
        <PrimaryButton
          onPress={handleApply}
          disabled={selected.length === 0}
          style={{ marginTop: 16 }}
        >
          Apply
        </PrimaryButton>
        <PrimaryButton lowlight onPress={handleClose}>
          Cancel
        </PrimaryButton>
      </View>
    </Modal>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
      backgroundColor: theme.card,
      padding: 16,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 12,
      textAlign: "center",
    },
    dayRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    dayLabel: {
      color: theme.text,
      fontSize: 16,
    },
  });
