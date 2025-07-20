import {
  View,
  StyleSheet,
  Platform,
  Text,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { useContext, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

import Title from "../ui/Title";
import CarouselButton from "../ui/CarouselButton";
import PrimaryButton from "../ui/PrimaryButton";
import { Colors } from "../../constants/Colors";
import { AppThemeContext } from "../../store/app-theme-context";
import formatTime from "../../util/formatTime";

function ScheduleSlide({ wizardState, setWizardState }) {
  const theme = Colors[useContext(AppThemeContext)];

  const [showCustom, setShowCustom] = useState(
    wizardState.schedule?.label === "Custom"
  );

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // If no schedule yet, initialize it so we always have dates to work with
  const startTime =
    wizardState.schedule?.start ?? new Date(Date.now() + 60 * 60 * 1000);
  const endTime =
    wizardState.schedule?.end ?? new Date(Date.now() + 5 * 60 * 60 * 1000);

  const presetSchedules = [
    {
      label: "Skip Breakfast 16:8 (12pm - 8pm)",
      start: new Date().setHours(12, 0, 0, 0),
      end: new Date().setHours(20, 0, 0, 0),
    },
    {
      label: "Work-Lunch Window 14:10 (9am - 7pm)",
      start: new Date().setHours(9, 0, 0, 0),
      end: new Date().setHours(19, 0, 0, 0),
    },
    {
      label: "After-Hours Fast 18:6 (1pm - 7pm)",
      start: new Date().setHours(13, 0, 0, 0),
      end: new Date().setHours(19, 0, 0, 0),
    },
  ];

  /* ---------- helpers ---------- */
  function selectPreset(schedule) {
    setWizardState((s) => ({
      ...s,
      schedule: {
        label: schedule.label,
        start: new Date(schedule.start),
        end: new Date(schedule.end),
      },
    }));
    setShowCustom(false);
  }

  function selectCustom() {
    setShowCustom(true);
    setWizardState((s) => ({
      ...s,
      schedule: {
        label: "Custom",
        start: startTime,
        end: endTime,
      },
    }));
  }

  const onChangeStart = (_e, date) => {
    if (Platform.OS !== "ios") setShowStartPicker(false);
    if (date) {
      setWizardState((s) => ({
        ...s,
        schedule: { ...s.schedule, start: date },
      }));
    }
  };

  const onChangeEnd = (_e, date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (date) {
      setWizardState((s) => ({
        ...s,
        schedule: { ...s.schedule, end: date },
      }));
    }
  };

  function goNext() {
    console.log(wizardState);
    setWizardState((s) => ({ ...s, step: Math.min(s.step + 1, 2) }));
  }

  /* ---------- render ---------- */
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
      <View style={styles(theme).container}>
        <View>
          <Title>Choose your Fasting Schedule</Title>
          {presetSchedules.map((preset) => (
            <CarouselButton
              key={preset.label}
              onPress={() => selectPreset(preset)}
              highlight={wizardState.schedule?.label === preset.label}
            >
              {preset.label}
            </CarouselButton>
          ))}

          {/* ---------------- Custom option ---------------- */}
          <CarouselButton onPress={selectCustom}>Custom</CarouselButton>

          {showCustom && (
            <View style={styles(theme).customContainer}>
              {/* Start time */}
              <Text style={styles(theme).customLabel}>Start</Text>
              <Pressable
                style={({ pressed }) => [
                  styles(theme).timeButton,
                  (pressed || showStartPicker) &&
                    styles(theme).timeButtonActive,
                ]}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles(theme).timeText}>
                  {formatTime(startTime)}
                </Text>
              </Pressable>

              {/* End time */}
              <Text style={[styles(theme).customLabel, { marginTop: 16 }]}>
                End
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles(theme).timeButton,
                  (pressed || showEndPicker) && styles(theme).timeButtonActive,
                ]}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles(theme).timeText}>
                  {formatTime(endTime)}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
        <PrimaryButton onPress={goNext}>Next</PrimaryButton>
      </View>

      {/* -------------- Start Picker Modal -------------- */}
      <Modal
        visible={showStartPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStartPicker(false)}
      >
        <Pressable
          style={styles(theme).modalBackdrop}
          onPress={() => setShowStartPicker(false)}
        />
        <View style={styles(theme).modalSheet}>
          <DateTimePicker
            mode="time"
            value={startTime}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            textColor={Platform.OS === "ios" ? theme.text : undefined}
            onChange={(e, d) => {
              onChangeStart(e, d);
              if (Platform.OS !== "ios") setShowStartPicker(false);
            }}
          />
          <PrimaryButton onPress={() => setShowStartPicker(false)}>
            Done
          </PrimaryButton>
        </View>
      </Modal>

      {/* -------------- End Picker Modal -------------- */}
      <Modal
        visible={showEndPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEndPicker(false)}
      >
        <Pressable
          style={styles(theme).modalBackdrop}
          onPress={() => setShowEndPicker(false)}
        />
        <View style={styles(theme).modalSheet}>
          <DateTimePicker
            mode="time"
            value={endTime}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            textColor={Platform.OS === "ios" ? theme.text : undefined}
            onChange={(e, d) => {
              onChangeEnd(e, d);
              if (Platform.OS !== "ios") setShowEndPicker(false);
            }}
          />
          <PrimaryButton onPress={() => setShowEndPicker(false)}>
            Done
          </PrimaryButton>
        </View>
      </Modal>
    </ScrollView>
  );
}

export default ScheduleSlide;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      margin: 16,
    },
    customContainer: {
      borderColor: theme.border,
      borderWidth: 2,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 8,
      marginTop: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
      backgroundColor: theme.card,
    },
    customLabel: {
      color: theme.text,
      fontSize: 14,
      marginBottom: 4,
    },
    timeButton: {
      borderColor: theme.border,
      borderWidth: 2,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      marginVertical: 4,
      backgroundColor: theme.card,
    },
    timeButtonActive: {
      opacity: 0.6,
    },
    timeText: {
      color: theme.text,
      fontSize: 18,
    },
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
