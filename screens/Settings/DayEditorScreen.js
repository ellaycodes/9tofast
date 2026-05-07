import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as dt from "date-fns";
import { useAppTheme } from "../../store/app-theme-context";
import { PRESET_SCHEDULES } from "../../store/fastingLogic/data/fasting-presets";
import CarouselButton from "../../components/ui/CarouselButton";
import CustomContainer from "../../components/Carousel/CustomContainer";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SchedulePickerModal from "../../modals/SchedulePickerModal";
import CopyToModal from "../../components/ui/CopyToModal";

const DAY_FULL = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function calcDuration({ start: startStr, end: endStr }) {
  const midnight = dt.startOfDay(new Date());
  let endDate = dt.parse(endStr, "HH:mm", midnight);
  const startDate = dt.parse(startStr, "HH:mm", midnight);
  if (endDate <= startDate) endDate = dt.addDays(endDate, 1);
  const durObj = dt.intervalToDuration({ start: startDate, end: endDate });
  const totalEatingHours = durObj.hours + (durObj.minutes / 60 || 0);
  return {
    eatingHours: Number(totalEatingHours.toFixed(2)),
    fastingHours: Number((24 - totalEatingHours).toFixed(2)),
  };
}

function initialConfig(dayConfig) {
  if (dayConfig) return dayConfig;
  return {
    type: "fast",
    start: "12:00",
    end: "20:00",
    fastingHours: 16,
    presetId: "skip-breakfast-16-8",
    label: "Skip Breakfast 16:8 (12pm - 8pm)",
  };
}

function deriveHighlightedLabel(config) {
  if (!config) return null;
  if (config.type === "rest") return "Rest Day";
  if (config.label === "Custom") return "Custom";
  const preset = PRESET_SCHEDULES.find((p) => p.id === config.presetId);
  return preset?.label ?? null;
}

export default function DayEditorScreen({ navigation, route }) {
  const { dayKey, dayConfig } = route.params;
  const { theme } = useAppTheme();

  const [chosenConfig, setChosenConfig] = useState(() => initialConfig(dayConfig));
  const [highlightedLabel, setHighlightedLabel] = useState(() =>
    deriveHighlightedLabel(initialConfig(dayConfig))
  );
  const [showCustom, setShowCustom] = useState(
    () => initialConfig(dayConfig).label === "Custom"
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showCopyTo, setShowCopyTo] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Prevents the beforeRemove guard from firing on intentional Save navigation
  const savingRef = useRef(false);

  // Unsaved-changes guard
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e) => {
      if (!isDirty || savingRef.current) return;
      e.preventDefault();
      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });
    return unsub;
  }, [navigation, isDirty]);

  // ---- selection handlers ----

  function selectPreset(preset) {
    const fastingHours = calcDuration({
      start: preset.start,
      end: preset.end,
    }).fastingHours;
    setChosenConfig({
      type: "fast",
      start: preset.start,
      end: preset.end,
      fastingHours,
      presetId: preset.id,
      label: preset.label,
    });
    setHighlightedLabel(preset.label);
    setShowCustom(false);
    setIsDirty(true);
  }

  function selectRestDay() {
    setChosenConfig({ type: "rest", start: "00:00", end: "00:00", fastingHours: 0 });
    setHighlightedLabel("Rest Day");
    setShowCustom(false);
    setIsDirty(true);
  }

  function selectCustom() {
    setChosenConfig((prev) => {
      const { presetId, ...rest } = prev;
      return { ...rest, type: "fast", label: "Custom" };
    });
    setHighlightedLabel("Custom");
    setShowCustom(true);
    setIsDirty(true);
  }

  const onChangeStart = (_e, date) => {
    if (Platform.OS !== "ios") setShowStartPicker(false);
    if (!(date instanceof Date)) return;
    const timeStr = dt.format(date, "HH:mm");
    const fastingHours = calcDuration({ start: timeStr, end: chosenConfig.end })
      .fastingHours;
    setChosenConfig((prev) => ({ ...prev, start: timeStr, fastingHours }));
    setIsDirty(true);
  };

  const onChangeEnd = (_e, date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (!(date instanceof Date)) return;
    const timeStr = dt.format(date, "HH:mm");
    const fastingHours = calcDuration({
      start: chosenConfig.start,
      end: timeStr,
    }).fastingHours;
    setChosenConfig((prev) => ({ ...prev, end: timeStr, fastingHours }));
    setIsDirty(true);
  };

  // ---- save / copy ----

  function navigate_back_with_result(config, copyToDays) {
    savingRef.current = true;
    navigation.navigate("EditScheduleScreen", {
      _dayResult: { dayKey, config, copyToDays: copyToDays ?? undefined },
    });
  }

  function handleSave() {
    navigate_back_with_result(chosenConfig);
  }

  function handleCopyToApply(targetDays) {
    navigate_back_with_result(chosenConfig, targetDays);
  }

  const isTooLong = chosenConfig.fastingHours > 20;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
    >
      <View style={styles.container}>
        <View>
          <Text style={[styles.dayTitle, { color: theme.text }]}>
            {DAY_FULL[dayKey] ?? dayKey}
          </Text>

          {PRESET_SCHEDULES.map((preset) => (
            <CarouselButton
              key={preset.id}
              onPress={() => selectPreset(preset)}
              highlight={highlightedLabel === preset.label}
            >
              {preset.label}
            </CarouselButton>
          ))}

          <CarouselButton
            onPress={selectRestDay}
            highlight={highlightedLabel === "Rest Day"}
          >
            Rest Day
          </CarouselButton>

          <CarouselButton
            onPress={selectCustom}
            highlight={highlightedLabel === "Custom"}
          >
            Custom
          </CarouselButton>

          {showCustom && chosenConfig.type !== "rest" && (
            <CustomContainer
              startTime={chosenConfig.start}
              onStartTimePress={() => setShowStartPicker(true)}
              onEndTimePress={() => setShowEndPicker(true)}
              endTime={chosenConfig.end}
            />
          )}
        </View>

        <View>
          {isTooLong && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              Please choose a longer eating window
            </Text>
          )}
          <PrimaryButton
            lowlight
            onPress={() => setShowCopyTo(true)}
            style={{ marginBottom: 0 }}
          >
            Copy to...
          </PrimaryButton>
          <PrimaryButton onPress={handleSave} disabled={isTooLong}>
            Save
          </PrimaryButton>
        </View>
      </View>

      <SchedulePickerModal
        showPicker={showStartPicker}
        onRequestClose={() => setShowStartPicker(false)}
        timeDate={chosenConfig.start}
        onChange={onChangeStart}
      />

      <SchedulePickerModal
        showPicker={showEndPicker}
        onRequestClose={() => setShowEndPicker(false)}
        timeDate={chosenConfig.end}
        onChange={onChangeEnd}
      />

      <CopyToModal
        visible={showCopyTo}
        sourceDayKey={dayKey}
        onApply={handleCopyToApply}
        onClose={() => setShowCopyTo(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    margin: 16,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
});
