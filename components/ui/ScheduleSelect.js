import { View, Platform } from "react-native";
import { useState } from "react";

import Title from "../../components/ui/Title";
import CarouselButton from "../../components/ui/CarouselButton";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { PRESET_SCHEDULES } from "../../store/fastingLogic/data/fasting-presets";
import CustomContainer from "../Carousel/CustomContainer";
import SchedulePickerModal from "../../modals/SchedulePickerModal";
import { useNavigation } from "@react-navigation/native";

function ScheduleSelect() {
  const { schedule, setSchedule } = useFasting();
  const navigate = useNavigation();

  const [showCustom, setShowCustom] = useState(schedule?.label === "Custom");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [chosenSchedule, setChosenSchedule] = useState({
    start: new Date(schedule.start),
    end: new Date(schedule.end),
  });
  const [highlightedLabel, setHighlightedLabel] = useState(null);

  const startTime =
    new Date(schedule?.start) ?? new Date(Date.now() + 60 * 60 * 1000);
  const endTime =
    new Date(schedule?.end) ?? new Date(Date.now() + 5 * 60 * 60 * 1000);

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

  console.log(schedule);

  function selectCustom() {
    const chosen = { label: "Custom", start: startTime, end: endTime };

    setShowCustom(true);
    setChosenSchedule(chosen);
    setHighlightedLabel(chosen.label);
  }

  function onTimePress(time) {
    time === "start" ? setShowStartPicker(true) : setShowEndPicker(true);
  }

  const onChangeStart = (_e, date) => {
    if (Platform.OS !== "ios") setShowStartPicker(false);
    if (date) {
      const updated = { ...chosenSchedule, start: date };
      setChosenSchedule(updated);
    }
  };

  const onChangeEnd = (_e, date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (date) {
      const updated = { ...chosenSchedule, end: date };
      setChosenSchedule(updated);
    }
  };

  function onSave() {
    setSchedule(chosenSchedule);
    navigate.goBack();
  }

  return (
    <>
      <View>
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
          {showCustom && schedule && (
            <CustomContainer
              startTime={chosenSchedule?.start || startTime}
              onStartTimePress={() => onTimePress("start")}
              onEndTimePress={() => onTimePress("end")}
              endTime={chosenSchedule?.end || endTime}
            />
          )}
        </View>
        <PrimaryButton onPress={onSave}>Save</PrimaryButton>
      </View>

      <SchedulePickerModal
        showPicker={showStartPicker}
        onRequestClose={() => setShowStartPicker(false)}
        timeDate={chosenSchedule?.start || startTime}
        onChange={onChangeStart}
      />

      <SchedulePickerModal
        showPicker={showEndPicker}
        onRequestClose={() => setShowEndPicker(false)}
        timeDate={chosenSchedule?.end || endTime}
        onChange={onChangeEnd}
      />
    </>
  );
}

export default ScheduleSelect;
