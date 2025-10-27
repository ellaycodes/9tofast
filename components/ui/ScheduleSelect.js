import { View, Platform, StyleSheet, ScrollView, Text } from "react-native";
import { useContext, useState } from "react";
import * as dt from "date-fns";

import Title from "../../components/ui/Title";
import CarouselButton from "../../components/ui/CarouselButton";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { PRESET_SCHEDULES } from "../../store/fastingLogic/data/fasting-presets";
import CustomContainer from "../Carousel/CustomContainer";
import SchedulePickerModal from "../../modals/SchedulePickerModal";
import { CommonActions, useNavigation } from "@react-navigation/native";
import ErrorText from "./ErrorText";
import { AuthContext } from "../../store/auth-context";
import { setFastingScheduleDb } from "../../firebase/fasting.db.js";
import { logWarn } from "../../util/logger";

function ScheduleSelect({ settings, setWizardState, token, userName, uid }) {
  const { schedule, setSchedule } = useFasting();
  const authCxt = useContext(AuthContext);
  const navigate = useNavigation();

  const initialIsCustom = schedule && schedule.label === "Custom";
  const defaultStart = dt.format(dt.addHours(dt.startOfHour(new Date()), 2), "HH:mm");
  const defaultEnd = dt.format(dt.addHours(dt.startOfHour(new Date()), 10), "HH:mm");
  const initialStart = schedule && schedule.start ? schedule.start : defaultStart;
  const initialEnd = schedule && schedule.end ? schedule.end : defaultEnd;
  const initialFastingHours =
    schedule && schedule.fastingHours != null ? schedule.fastingHours : 8;

  const [showCustom, setShowCustom] = useState(initialIsCustom);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [chosenSchedule, setChosenSchedule] = useState({
    start: initialStart,
    end: initialEnd,
    fastingHours: initialFastingHours,
    label: schedule && schedule.label ? schedule.label : undefined,
  });
  const [highlightedLabel, setHighlightedLabel] = useState(null);

  function selectPreset(schedule) {
    const chosenPreset = {
      label: schedule.label,
      start: schedule.start,
      end: schedule.end,
      fastingHours: calcDuration({ start: schedule.start, end: schedule.end })
        .fastingHours,
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

  function calcDuration({ start: startStr, end: endStr }) {
    const midnight = dt.startOfDay(new Date());
    let endDate = dt.parse(endStr, "HH:mm", midnight);
    const startDate = dt.parse(startStr, "HH:mm", midnight);

    if (endDate <= startDate) {
      endDate = dt.addDays(endDate, 1);
    }

    const durObj = dt.intervalToDuration({ start: startDate, end: endDate });

    const totalEatingHours = durObj.hours + (durObj.minutes / 60 || 0);

    const eatingHours = Number(totalEatingHours.toFixed(2));

    const fastingHours = Number((24 - totalEatingHours).toFixed(2));

    return { eatingHours, fastingHours };
  }

  const onChangeStart = (_e, date) => {
    if (Platform.OS !== "ios") setShowStartPicker(false);
    if (!(date instanceof Date)) return;

    const timeStr = dt.format(date, "HH:mm");
    const fastingDuration = calcDuration({
      start: timeStr,
      end: chosenSchedule.end,
    }).fastingHours;
    const updated = {
      ...chosenSchedule,
      start: timeStr,
      fastingHours: fastingDuration,
    };
    setChosenSchedule(updated);
  };

  const onChangeEnd = (_e, date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (!(date instanceof Date)) return;

    const timeStr = dt.format(date, "HH:mm");
    const fastingDuration = calcDuration({
      start: chosenSchedule.start,
      end: timeStr,
    }).fastingHours;
    const updated = {
      ...chosenSchedule,
      end: timeStr,
      fastingHours: fastingDuration,
    };
    setChosenSchedule(updated);
  };

  function isFastingTooLong({ fastingHours }) {
    return fastingHours > 18;
  }

  async function onSave(settings) {
    setSchedule(chosenSchedule);

    const userId = uid || authCxt.uid;
    if (userId) {
      try {
        await setFastingScheduleDb(userId, chosenSchedule);
      } catch (error) {
        logWarn("setFastingScheduleDb", error);
      }
    }

    if (settings) {
      navigate.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {
              name: "Settings",
              state: {
                index: 0,
                routes: [{ name: "SettingsHomeScreen" }],
              },
            },
            {
              name: "TimerScreen",
            },
          ],
        })
      );
    } else {
      setWizardState((s) => ({ ...s, step: Math.min(s.step + 1, 2) }));
    }
  }

  function onSkip() {
    authCxt.authenticate(token, userName, uid);
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
              startTime={chosenSchedule.start}
              onStartTimePress={() => onTimePress("start")}
              onEndTimePress={() => onTimePress("end")}
              endTime={chosenSchedule.end}
            />
          )}
        </View>
        {isFastingTooLong(chosenSchedule) && (
          <ErrorText>Please choose a longer eating window</ErrorText>
        )}
        <View>
          {settings ? null : (
            <PrimaryButton lowlight onPress={onSkip}>
              Skip
            </PrimaryButton>
          )}
          {settings ? (
            <PrimaryButton
              onPress={() => onSave(settings)}
              disabled={chosenSchedule.fastingHours > 18}
              style={{ marginTop: 0 }}
            >
              Save
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onPress={() => onSave(false)}
              disabled={chosenSchedule.fastingHours > 18}
            >
              Next
            </PrimaryButton>
          )}
        </View>
      </View>

      <SchedulePickerModal
        showPicker={showStartPicker}
        onRequestClose={() => setShowStartPicker(false)}
        timeDate={chosenSchedule.start}
        onChange={onChangeStart}
      />

      <SchedulePickerModal
        showPicker={showEndPicker}
        onRequestClose={() => setShowEndPicker(false)}
        timeDate={chosenSchedule.end}
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
