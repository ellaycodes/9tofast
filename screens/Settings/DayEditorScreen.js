import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as dt from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../store/app-theme-context";
import { PRESET_SCHEDULES } from "../../store/fastingLogic/data/fasting-presets";
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

function formatHour(timeStr) {
  return dt.format(dt.parse(timeStr, "HH:mm", new Date()), "h:mm");
}

function formatPeriod(timeStr) {
  return dt.format(dt.parse(timeStr, "HH:mm", new Date()), "a");
}

function formatTimePretty(timeStr) {
  const d = dt.parse(timeStr, "HH:mm", new Date());
  const minutes = d.getMinutes();
  return dt.format(d, minutes === 0 ? "ha" : "h:mma").toLowerCase();
}

function presetSubtitle(preset) {
  const ratio = `${preset.fastingHours}:${24 - preset.fastingHours}`;
  return `${ratio} · ${formatTimePretty(preset.start)} – ${formatTimePretty(preset.end)}`;
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

function RadioOption({ title, subtitle, selected, onPress, theme }) {
  return (
    <Pressable
      style={[styles.radioRow, { borderBottomColor: theme.border }]}
      onPress={onPress}
    >
      <View
        style={[
          styles.radioOuter,
          { borderColor: selected ? theme.primary100 : theme.border },
        ]}
      >
        {selected && (
          <View
            style={[styles.radioInner, { backgroundColor: theme.primary100 }]}
          />
        )}
      </View>
      <View style={styles.radioContent}>
        <Text style={[styles.radioTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.radioSubtitle, { color: theme.muted }]}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
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

  const savingRef = useRef(false);

  // Unsaved-changes guard — also fires on swipe-to-dismiss
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
    const fastingHours = calcDuration({ start: timeStr, end: chosenConfig.end }).fastingHours;
    setChosenConfig((prev) => ({ ...prev, start: timeStr, fastingHours }));
    setIsDirty(true);
  };

  const onChangeEnd = (_e, date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (!(date instanceof Date)) return;
    const timeStr = dt.format(date, "HH:mm");
    const fastingHours = calcDuration({ start: chosenConfig.start, end: timeStr }).fastingHours;
    setChosenConfig((prev) => ({ ...prev, end: timeStr, fastingHours }));
    setIsDirty(true);
  };

  // ---- save / copy ----

  const navigate_back_with_result = useCallback(
    (config, copyToDays) => {
      savingRef.current = true;
      navigation.navigate("EditScheduleScreen", {
        _dayResult: { dayKey, config, copyToDays: copyToDays ?? undefined },
      });
    },
    [navigation, dayKey]
  );

  const handleSave = useCallback(() => {
    navigate_back_with_result(chosenConfig);
  }, [navigate_back_with_result, chosenConfig]);

  function handleCopyToApply(targetDays) {
    navigate_back_with_result(chosenConfig, targetDays);
  }

  const isTooLong = chosenConfig.fastingHours > 20;

  // Cancel / Done in the navigation header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={styles.headerBtn}
        >
          <Text style={[styles.headerCancel, { color: theme.muted }]}>
            Cancel
          </Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          hitSlop={10}
          disabled={isTooLong}
          style={styles.headerBtn}
        >
          <Text
            style={[
              styles.headerDone,
              { color: isTooLong ? theme.muted : theme.primary100 },
            ]}
          >
            Done
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, theme, handleSave, isTooLong]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={[styles.sectionLabel, { color: theme.muted }]}>
          Schedule
        </Text>

        {PRESET_SCHEDULES.map((preset) => (
          <RadioOption
            key={preset.id}
            title={preset.shortName}
            subtitle={presetSubtitle(preset)}
            selected={highlightedLabel === preset.label}
            onPress={() => selectPreset(preset)}
            theme={theme}
          />
        ))}

        <RadioOption
          title="Free Day"
          subtitle="No fasting"
          selected={highlightedLabel === "Rest Day"}
          onPress={selectRestDay}
          theme={theme}
        />

        <RadioOption
          title="Custom"
          subtitle="Set your own hours"
          selected={highlightedLabel === "Custom"}
          onPress={selectCustom}
          theme={theme}
        />

        {chosenConfig.type !== "rest" && (
          <View style={styles.eatingWindowSection}>
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>
              Eating window
            </Text>
            <View style={[styles.windowBox, { backgroundColor: theme.card }]}>
              <Pressable
                style={styles.timeCol}
                onPress={showCustom ? () => setShowStartPicker(true) : undefined}
                disabled={!showCustom}
              >
                <Text style={[styles.timeLabel, { color: theme.muted }]}>
                  Start
                </Text>
                <Text style={[styles.timeLarge, { color: theme.text }]}>
                  {formatHour(chosenConfig.start)}
                </Text>
                <Text style={[styles.timePeriod, { color: theme.muted }]}>
                  {formatPeriod(chosenConfig.start)}
                </Text>
              </Pressable>

              <Ionicons
                name="arrow-forward"
                size={18}
                color={theme.muted}
                style={styles.arrowIcon}
              />

              <Pressable
                style={styles.timeCol}
                onPress={showCustom ? () => setShowEndPicker(true) : undefined}
                disabled={!showCustom}
              >
                <Text style={[styles.timeLabel, { color: theme.muted }]}>
                  End
                </Text>
                <Text style={[styles.timeLarge, { color: theme.text }]}>
                  {formatHour(chosenConfig.end)}
                </Text>
                <Text style={[styles.timePeriod, { color: theme.muted }]}>
                  {formatPeriod(chosenConfig.end)}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {isTooLong && (
          <Text style={[styles.errorText, { color: theme.error }]}>
            Please choose a longer eating window
          </Text>
        )}

        <PrimaryButton
          lowlight
          onPress={() => setShowCopyTo(true)}
          style={styles.copyBtn}
        >
          Copy to...
        </PrimaryButton>
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
    margin: 16,
  },
  // Navigation header
  headerBtn: {
    paddingHorizontal: 4,
  },
  headerCancel: {
    fontSize: 16,
  },
  headerDone: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Section labels
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  // Radio options
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  radioSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  // Eating window
  eatingWindowSection: {
    marginTop: 24,
  },
  windowBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 12,
    padding: 20,
  },
  timeCol: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  timeLarge: {
    fontSize: 28,
    fontWeight: "300",
  },
  timePeriod: {
    fontSize: 14,
    marginTop: 2,
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  // Error / Copy
  errorText: {
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  copyBtn: {
    marginTop: 24,
  },
});
