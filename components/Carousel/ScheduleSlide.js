import { View, StyleSheet, Platform, ScrollView } from "react-native";
import { useState } from "react";

import Title from "../ui/Title";
import CarouselButton from "../ui/CarouselButton";
import PrimaryButton from "../ui/PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { PRESET_SCHEDULES } from "../../store/fastingLogic/data/fasting-presets";
import CustomContainer from "./CustomContainer";
import SchedulePickerModal from "../../modals/SchedulePickerModal";

function ScheduleSlide({ setWizardState }) {
  const { setSchedule, schedule } = useFasting();

  const [showCustom, setShowCustom] = useState(schedule?.label === "Custom");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const startTime = schedule?.start ?? new Date(Date.now() + 60 * 60 * 1000);
  const endTime = schedule?.end ?? new Date(Date.now() + 5 * 60 * 60 * 1000);

  function selectPreset(schedule) {
    const chosenPreset = {
      label: schedule.label,
      start: schedule.start,
      end: schedule.end,
    };

    setSchedule(chosenPreset);
    setShowCustom(false);
  }

  function selectCustom() {
    const chosen = { label: "Custom", start: startTime, end: endTime };

    setShowCustom(true);
    setSchedule(chosen);
  }

  function onTimePress(time) {
    time === "start" ? setShowStartPicker(true) : setShowEndPicker(true);
  }

  const onChangeStart = (_e, date) => {
    if (Platform.OS !== "ios") setShowStartPicker(false);
    if (date) {
      const updated = { ...schedule, start: date };
      setSchedule(updated);
    }
  };

  const onChangeEnd = (_e, date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (date) {
      const updated = { ...schedule, end: date };
      setSchedule(updated);
    }
  };

  function goNext() {
    setWizardState((s) => ({ ...s, step: Math.min(s.step + 1, 2) }));
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
              highlight={schedule?.label === preset.label}
            >
              {preset.label}
            </CarouselButton>
          ))}

          <CarouselButton onPress={selectCustom}>Custom</CarouselButton>
          {showCustom && schedule && (
            <CustomContainer
              startTime={startTime}
              onStartTimePress={() => onTimePress("start")}
              onEndTimePress={() => onTimePress("end")}
              endTime={endTime}
            />
          )}
        </View>
        <PrimaryButton onPress={goNext}>Next</PrimaryButton>
      </View>

      <SchedulePickerModal
        showPicker={showStartPicker}
        onRequestClose={() => setShowStartPicker(false)}
        timeDate={startTime}
        onChange={onChangeStart}
      />

      <SchedulePickerModal
        showPicker={showEndPicker}
        onRequestClose={() => setShowEndPicker(false)}
        timeDate={endTime}
        onChange={onChangeEnd}
      />
    </ScrollView>
  );
}

export default ScheduleSlide;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    margin: 16,
  },
});
