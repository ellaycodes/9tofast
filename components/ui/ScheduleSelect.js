import {
  View,
  Platform,
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
import {
  DAY_KEYS,
  applyToAllDays,
  setDayConfig,
  getDayKey,
} from "../../store/fastingLogic/data/weekly-schedule";

// --- helpers ---

function deriveHighlightedLabel(weekly) {
  if (!weekly) return null;
  if (weekly.mode === "perDay") return null;
  const config = weekly.days?.monday;
  if (!config) return null;
  if (config.type === "rest") return "Rest Day";
  if (config.label === "Custom") return "Custom";
  const preset = PRESET_SCHEDULES.find((p) => p.id === config.presetId);
  return preset?.label ?? null;
}

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

// ---

function ScheduleSelect({ settings, setWizardState, token, userName, uid }) {
  const { schedule, weeklySchedule, setSchedule, isFasting, events, endFast } =
    useFasting();
  const authCxt = useContext(AuthContext);
  const navigate = useNavigation();
  const route = useRoute();

  // ---- shared flat-schedule state (drives custom time pickers in both modes) ----
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

  const initialIsCustom = settings
    ? weeklySchedule?.mode === "uniform" &&
      weeklySchedule?.days?.monday?.label === "Custom"
    : schedule?.label === "Custom";

  const [showCustom, setShowCustom] = useState(initialIsCustom);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [chosenSchedule, setChosenSchedule] = useState({
    start: initialStart,
    end: initialEnd,
    fastingHours: initialFastingHours,
    label: schedule?.label,
    timeZone: initialTimeZone,
  });

  // ---- settings-mode draft weekly state ----
  const [draftWeekly, setDraftWeekly] = useState(
    settings ? weeklySchedule : null
  );
  const [highlightedLabel, setHighlightedLabel] = useState(
    settings
      ? deriveHighlightedLabel(weeklySchedule)
      : schedule?.label ?? null
  );

  // ---- in-progress fast prompt state ----
  const [pendingSchedule, setPendingSchedule] = useState(null);
  const [showFastPrompt, setShowFastPrompt] = useState(false);

  // Track last applied result to avoid double-applying the same _dayResult param
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
    // If the user came back from a per-day edit, no single preset is active
    setHighlightedLabel(null);
  }, [route.params?._dayResult]);

  // ---- preset / rest / custom selection ----

  function selectPreset(preset) {
    const fastingHours = calcDuration({
      start: preset.start,
      end: preset.end,
    }).fastingHours;
    const flatPreset = {
      label: preset.label,
      presetId: preset.id,
      start: preset.start,
      end: preset.end,
      fastingHours,
      timeZone: initialTimeZone,
    };
    setChosenSchedule(flatPreset);
    setShowCustom(false);
    setHighlightedLabel(preset.label);

    if (settings) {
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
      setDraftWeekly(applyToAllDays(base, dayConfig));
    }
  }

  function selectRestDay() {
    setShowCustom(false);
    setHighlightedLabel("Rest Day");
    if (settings) {
      const restConfig = { type: "rest", start: "00:00", end: "00:00", fastingHours: 0 };
      const base = draftWeekly ?? {
        mode: "uniform",
        timeZone: initialTimeZone,
        days: {},
      };
      setDraftWeekly(applyToAllDays(base, restConfig));
    }
  }

  function selectCustom() {
    setShowCustom(true);
    setChosenSchedule((s) => ({ ...s, label: "Custom" }));
    setHighlightedLabel("Custom");
    if (settings) {
      const customConfig = {
        type: "fast",
        start: chosenSchedule.start,
        end: chosenSchedule.end,
        fastingHours: chosenSchedule.fastingHours,
        label: "Custom",
      };
      const base = draftWeekly ?? {
        mode: "uniform",
        timeZone: initialTimeZone,
        days: {},
      };
      setDraftWeekly(applyToAllDays(base, customConfig));
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
    const updated = { ...chosenSchedule, start: timeStr, fastingHours };
    setChosenSchedule(updated);
    if (settings && showCustom) {
      const customConfig = { type: "fast", ...updated, label: "Custom" };
      const base = draftWeekly ?? {
        mode: "uniform",
        timeZone: initialTimeZone,
        days: {},
      };
      setDraftWeekly(applyToAllDays(base, customConfig));
    }
  };

  const onChangeEnd = (_e, date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (!(date instanceof Date)) return;
    const timeStr = dt.format(date, "HH:mm");
    const fastingHours = calcDuration({
      start: chosenSchedule.start,
      end: timeStr,
    }).fastingHours;
    const updated = { ...chosenSchedule, end: timeStr, fastingHours };
    setChosenSchedule(updated);
    if (settings && showCustom) {
      const customConfig = { type: "fast", ...updated, label: "Custom" };
      const base = draftWeekly ?? {
        mode: "uniform",
        timeZone: initialTimeZone,
        days: {},
      };
      setDraftWeekly(applyToAllDays(base, customConfig));
    }
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
      // Onboarding mode — unchanged
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
      // Check that the active fast started today (attribution rule)
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
    // Preserve today's current config so the active fast is unaffected
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

  const isTooLong = isFastingTooLong(chosenSchedule);
  const isPerDay = settings && draftWeekly?.mode === "perDay";

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

          {settings && (
            <CarouselButton
              onPress={selectRestDay}
              highlight={highlightedLabel === "Rest Day"}
            >
              Rest Day
            </CarouselButton>
          )}

          <CarouselButton
            onPress={selectCustom}
            highlight={highlightedLabel === "Custom"}
          >
            Custom
          </CarouselButton>

          {isPerDay && (
            <Text style={styles.variesLabel}>Schedule varies by day</Text>
          )}

          {showCustom && (
            <CustomContainer
              startTime={chosenSchedule.start}
              onStartTimePress={() => onTimePress("start")}
              onEndTimePress={() => onTimePress("end")}
              endTime={chosenSchedule.end}
            />
          )}

          {settings && draftWeekly && (
            <View style={styles.dayRowsContainer}>
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
        </View>

        {isTooLong && (
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
              onPress={() => onSave(true)}
              style={{ marginTop: 16 }}
              disabled={isTooLong}
            >
              Save
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onPress={() => onSave(false)}
              disabled={isTooLong}
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

      <ActiveFastPrompt
        visible={showFastPrompt}
        onStartTomorrow={handleStartTomorrow}
        onApplyNow={handleApplyNow}
        onClose={() => setShowFastPrompt(false)}
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
  variesLabel: {
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  dayRowsContainer: {
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
});
