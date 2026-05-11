import {
  View,
  Platform,
  Pressable,
  StyleSheet,
  ScrollView,
  Text,
} from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import * as dt from "date-fns";

import Title from "../../components/ui/Title";
import CarouselButton from "../../components/ui/CarouselButton";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { PRESET_SCHEDULES } from "../../store/fastingLogic/data/fasting-presets";
import CustomContainer from "../Carousel/CustomContainer";
import SchedulePickerModal from "../../modals/SchedulePickerModal";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import ErrorText from "./ErrorText";
import { AuthContext } from "../../store/auth-context";
import { getResolvedTimeZone } from "../../util/timezone";
import DayRow from "../Settings/DayRow";
import ActiveFastPrompt from "./ActiveFastPrompt";
import { useAppTheme } from "../../store/app-theme-context";
import {
  DAY_KEYS,
  applyToAllDays,
  setDayConfig,
  getDayKey,
} from "../../store/fastingLogic/data/weekly-schedule";

// --- helpers ---

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

function PresetChip({ label, onPress, theme }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: theme.border,
          backgroundColor: pressed ? theme.card : theme.background,
        },
      ]}
      onPress={onPress}
      hitSlop={4}
    >
      <Text style={[styles.chipText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

// ---

function ScheduleSelect({ settings, setWizardState, token, userName, uid }) {
  const { schedule, weeklySchedule, setSchedule, isFasting, events, endFast } =
    useFasting();
  const authCxt = useContext(AuthContext);
  const { theme } = useAppTheme();
  const navigate = useNavigation();
  const route = useRoute();

  const defaultStart = dt.format(
    dt.addHours(dt.startOfHour(new Date()), 2),
    "HH:mm"
  );
  const defaultEnd = dt.format(
    dt.addHours(dt.startOfHour(new Date()), 10),
    "HH:mm"
  );
  const initialTimeZone = getResolvedTimeZone();

  const initialStart = schedule?.start ?? defaultStart;
  const initialEnd = schedule?.end ?? defaultEnd;
  const initialFastingHours = schedule?.fastingHours ?? 8;

  const [showCustom, setShowCustom] = useState(
    settings ? false : schedule?.label === "Custom"
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [chosenSchedule, setChosenSchedule] = useState({
    start: initialStart,
    end: initialEnd,
    fastingHours: initialFastingHours,
    label: schedule?.label,
    timeZone: initialTimeZone,
  });

  const [draftWeekly, setDraftWeekly] = useState(
    settings ? weeklySchedule : null
  );
  // Onboarding mode uses highlightedLabel for CarouselButton state
  const [highlightedLabel, setHighlightedLabel] = useState(
    settings ? null : schedule?.label ?? null
  );

  // Undo toast (settings mode only)
  const [undoVisible, setUndoVisible] = useState(false);
  const prevDraftRef = useRef(null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const [pendingSchedule, setPendingSchedule] = useState(null);
  const [showFastPrompt, setShowFastPrompt] = useState(false);

  const lastDayResultRef = useRef(null);

  // Pick up results returned from DayEditorScreen
  useEffect(() => {
    const result = route.params?._dayResult;
    if (!result || result === lastDayResultRef.current) return;
    lastDayResultRef.current = result;
    const { dayKey, config, copyToDays } = result;
    setDraftWeekly((prev) => {
      if (!prev) return prev;
      let updated = setDayConfig(prev, dayKey, config);
      if (copyToDays?.length) {
        for (const day of copyToDays) {
          updated = setDayConfig(updated, day, config);
        }
      }
      return updated;
    });
  }, [route.params?._dayResult]);

  // ---- onboarding-mode selection ----

  function selectPreset(preset) {
    const fastingHours = calcDuration({
      start: preset.start,
      end: preset.end,
    }).fastingHours;
    setChosenSchedule({
      label: preset.label,
      presetId: preset.id,
      start: preset.start,
      end: preset.end,
      fastingHours,
      timeZone: initialTimeZone,
    });
    setShowCustom(false);
    setHighlightedLabel(preset.label);
  }

  function selectCustom() {
    setShowCustom(true);
    setChosenSchedule((s) => ({ ...s, label: "Custom" }));
    setHighlightedLabel("Custom");
  }

  // ---- settings-mode: apply preset to all days ----

  function applyPresetToAll(preset) {
    const fastingHours = calcDuration({
      start: preset.start,
      end: preset.end,
    }).fastingHours;
    const dayConfig = {
      type: "fast",
      start: preset.start,
      end: preset.end,
      fastingHours,
      presetId: preset.id,
      label: preset.label,
    };
    const base = draftWeekly ?? {
      mode: "uniform",
      timeZone: initialTimeZone,
      days: {},
    };
    prevDraftRef.current = draftWeekly;
    setDraftWeekly(applyToAllDays(base, dayConfig));

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoVisible(true);
    undoTimerRef.current = setTimeout(() => setUndoVisible(false), 4000);
  }

  function handleUndo() {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoVisible(false);
    if (prevDraftRef.current !== null) {
      setDraftWeekly(prevDraftRef.current);
    }
  }

  function onTimePress(time) {
    time === "start" ? setShowStartPicker(true) : setShowEndPicker(true);
  }

  const onChangeStart = (_e, date) => {
    if (Platform.OS !== "ios") setShowStartPicker(false);
    if (!(date instanceof Date)) return;
    const timeStr = dt.format(date, "HH:mm");
    const fastingHours = calcDuration({
      start: timeStr,
      end: chosenSchedule.end,
    }).fastingHours;
    setChosenSchedule((prev) => ({ ...prev, start: timeStr, fastingHours }));
  };

  const onChangeEnd = (_e, date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (!(date instanceof Date)) return;
    const timeStr = dt.format(date, "HH:mm");
    const fastingHours = calcDuration({
      start: chosenSchedule.start,
      end: timeStr,
    }).fastingHours;
    setChosenSchedule((prev) => ({ ...prev, end: timeStr, fastingHours }));
  };

  function isFastingTooLong({ fastingHours }) {
    return fastingHours > 20;
  }

  function onDayRowPress(dayKey) {
    navigate.push("DayEditorScreen", {
      dayKey,
      dayConfig: draftWeekly?.days?.[dayKey] ?? null,
    });
  }

  // ---- save flow ----

  async function commitSchedule(toSave) {
    await setSchedule(toSave);
    navigate.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: "Settings",
            state: { index: 0, routes: [{ name: "SettingsHomeScreen" }] },
          },
          { name: "TimerScreen" },
        ],
      })
    );
  }

  async function onSave(isSettings) {
    if (!isSettings) {
      await setSchedule(chosenSchedule);
      setWizardState((s) => ({ ...s, step: Math.min(s.step + 1, 2) }));
      return;
    }

    const toSave = draftWeekly;
    if (!toSave) return;

    const timeZone = toSave.timeZone ?? initialTimeZone;
    const todayKey = getDayKey(new Date(), timeZone);
    const todayOldConfig = weeklySchedule?.days?.[todayKey];
    const todayNewConfig = toSave.days?.[todayKey];

    const todayConfigChanged =
      todayOldConfig &&
      todayNewConfig &&
      (todayOldConfig.start !== todayNewConfig.start ||
        todayOldConfig.end !== todayNewConfig.end ||
        todayOldConfig.type !== todayNewConfig.type);

    if (todayConfigChanged && isFasting()) {
      const lastStart = [...events].reverse().find((e) => e.type === "start");
      if (lastStart) {
        const fastDayKey = getDayKey(lastStart.ts, timeZone);
        if (fastDayKey === todayKey) {
          setPendingSchedule(toSave);
          setShowFastPrompt(true);
          return;
        }
      }
    }

    await commitSchedule(toSave);
  }

  async function handleStartTomorrow() {
    const timeZone = pendingSchedule.timeZone ?? initialTimeZone;
    const todayKey = getDayKey(new Date(), timeZone);
    const todayOldConfig = weeklySchedule?.days?.[todayKey];
    const preserved = todayOldConfig
      ? setDayConfig(pendingSchedule, todayKey, todayOldConfig)
      : pendingSchedule;
    setShowFastPrompt(false);
    await commitSchedule(preserved);
  }

  async function handleApplyNow() {
    const timeZone = pendingSchedule.timeZone ?? initialTimeZone;
    const todayKey = getDayKey(new Date(), timeZone);
    setShowFastPrompt(false);
    await commitSchedule(pendingSchedule);
    if (pendingSchedule.days?.[todayKey]?.type === "rest") {
      await endFast("manual");
    }
  }

  function onSkip() {
    try {
      authCxt.authenticate(token, userName, uid);
      authCxt.completeOnboarding();
    } catch (err) {
      console.warn(err);
    }
  }

  // Validation only applies in onboarding mode; per-day validation is in DayEditorScreen
  const isTooLong = settings ? false : isFastingTooLong(chosenSchedule);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {settings ? (
            <>
              <Text style={[styles.sectionHeading, { color: theme.muted }]}>
                Apply to all days
              </Text>
              <View style={styles.chipRow}>
                {PRESET_SCHEDULES.map((preset) => (
                  <PresetChip
                    key={preset.id}
                    label={`${preset.fastingHours}:${24 - preset.fastingHours}`}
                    onPress={() => applyPresetToAll(preset)}
                    theme={theme}
                  />
                ))}
              </View>

              <Text style={[styles.sectionHeading, { color: theme.muted }]}>
                Your week
              </Text>

              {draftWeekly && (
                <View
                  style={[
                    styles.dayRowsContainer,
                    {
                      borderTopColor: theme.border,
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  {DAY_KEYS.map((dayKey) => (
                    <DayRow
                      key={dayKey}
                      dayKey={dayKey}
                      config={draftWeekly.days?.[dayKey]}
                      onPress={() => onDayRowPress(dayKey)}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonArea}>
        {isTooLong && (
          <ErrorText>Please choose a longer eating window</ErrorText>
        )}
        {!settings && (
          <PrimaryButton lowlight onPress={onSkip}>
            Skip
          </PrimaryButton>
        )}
        <PrimaryButton
          onPress={() => onSave(!!settings)}
          disabled={isTooLong}
        >
          {settings ? "Save" : "Next"}
        </PrimaryButton>
      </View>

      {undoVisible && (
        <View style={[styles.toast, { backgroundColor: theme.card }]}>
          <Text style={[styles.toastText, { color: theme.text }]}>
            Applied to all days
          </Text>
          <Pressable onPress={handleUndo} hitSlop={8}>
            <Text style={[styles.toastAction, { color: theme.primary100 }]}>
              Undo
            </Text>
          </Pressable>
        </View>
      )}

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

      <ActiveFastPrompt
        visible={showFastPrompt}
        onStartTomorrow={handleStartTomorrow}
        onApplyNow={handleApplyNow}
        onClose={() => setShowFastPrompt(false)}
      />
    </View>
  );
}

export default ScheduleSelect;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    margin: 16,
  },
  // Settings mode
  sectionHeading: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 2,
  },
  chipRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dayRowsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  // Buttons (outside scroll)
  buttonArea: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  // Undo toast overlay
  toast: {
    position: "absolute",
    bottom: 88,
    left: 16,
    right: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    fontSize: 14,
  },
  toastAction: {
    fontSize: 14,
    fontWeight: "700",
  },
});
