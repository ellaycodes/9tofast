import { View, Platform, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { format, addHours, startOfHour } from "date-fns";

import Title from "../../components/ui/Title";
import CarouselButton from "../../components/ui/CarouselButton";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { PRESET_SCHEDULES } from "../../store/fastingLogic/data/fasting-presets";
import CustomContainer from "../Carousel/CustomContainer";
import SchedulePickerModal from "../../modals/SchedulePickerModal";
import { useNavigation } from "@react-navigation/native";

function ScheduleSelect({ settings, setWizardState }) {
  const { schedule, setSchedule } = useFasting();
  const navigate = useNavigation();

  const [showCustom, setShowCustom] = useState(schedule?.label === "Custom");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [chosenSchedule, setChosenSchedule] = useState({
    start:
      schedule?.start ?? format(addHours(startOfHour(new Date()), 2), "HH:mm"),
    end:
      schedule?.end ?? format(addHours(startOfHour(new Date()), 10), "HH:mm"),
  });
  const [highlightedLabel, setHighlightedLabel] = useState(null);

  function selectPreset(schedule) {
    const chosenPreset = {
      label: schedule.label,
      start: schedule.start,
      end: schedule.end,
    };

    setChosenSchedule(chosenPreset);
    setShowCustom(false);
    setHighlightedLabel(chosenPreset.label);
  }

  function selectCustom() {
    setShowCustom(true);
    setChosenSchedule({ ...chosenSchedule, label: "Custom" });
    setHighlightedLabel("Custom");
  }

  function onTimePress(time) {
    time === "start" ? setShowStartPicker(true) : setShowEndPicker(true);
  }

  const onChangeStart = (_e, date) => {
    if (Platform.OS !== "ios") setShowStartPicker(false);
    if (date instanceof Date) {
      date = format(date, "HH:mm");
    }
    if (date) {
      const updated = { ...chosenSchedule, start: date };
      setChosenSchedule(updated);
    }
  };

  const onChangeEnd = (_e, date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (date instanceof Date) {
      date = format(date, "HH:mm");
    }
    if (date) {
      const updated = { ...chosenSchedule, end: date };
      setChosenSchedule(updated);
    }
  };

  function onSave() {
    setSchedule(chosenSchedule);
    navigate.goBack();
  }

  function goNext() {
    setWizardState((s) => ({ ...s, step: Math.min(s.step + 1, 2) }));
    setSchedule(chosenSchedule);
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
    >
      <View style={styles.container}>
        <View>
          <Title>Choose your Fasting Schedule</Title>
          {PRESET_SCHEDULES.map((preset) => (
            <CarouselButton
              key={preset.label}
              onPress={() => selectPreset(preset)}
              highlight={highlightedLabel === preset.label}
            >
              {preset.label}
            </CarouselButton>
          ))}

          <CarouselButton
            onPress={selectCustom}
            highlight={highlightedLabel === "Custom"}
          >
            Custom
          </CarouselButton>

          {showCustom && (
            <CustomContainer
              startTime={chosenSchedule?.start}
              onStartTimePress={() => onTimePress("start")}
              onEndTimePress={() => onTimePress("end")}
              endTime={chosenSchedule?.end}
            />
          )}
        </View>
        {settings ? (
          <PrimaryButton onPress={onSave}>Save</PrimaryButton>
        ) : (
          <PrimaryButton onPress={goNext}>Next</PrimaryButton>
        )}
      </View>

      <SchedulePickerModal
        showPicker={showStartPicker}
        onRequestClose={() => setShowStartPicker(false)}
        timeDate={chosenSchedule?.start}
        onChange={onChangeStart}
      />

      <SchedulePickerModal
        showPicker={showEndPicker}
        onRequestClose={() => setShowEndPicker(false)}
        timeDate={chosenSchedule?.end}
        onChange={onChangeEnd}
      />
    </ScrollView>
  );
}

export default ScheduleSelect;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    margin: 16,
  },
});
