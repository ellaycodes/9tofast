import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

import Title from "../ui/Title";
import PrimaryButton from "../ui/PrimaryButton";
import { Colors } from "../../constants/Colors";
import { AppThemeContext } from "../../store/app-theme-context";
import { AuthContext } from "../../store/auth-context";
import { useFasting } from "../../store/fasting-context";
import { asHms, fmt, todayWindow } from "../../util/formatTime";

export default function StartTimerSlide({
  wizardState,
  setWizardState,
  token,
}) {
  const themeName = useContext(AppThemeContext);
  const theme = Colors[themeName];
  const authCxt = useContext(AuthContext);
  const { setSchedule, startFast } = useFasting();

  const { schedule } = wizardState;

  const [started, setStarted] = useState(!!wizardState.fastStartedAt);
  const [readout, setReadout] = useState("\u00A0"); // non‑breaking space as placeholder

  useEffect(() => {
    if (!started) return;

    const id = setInterval(() => {
      const now = new Date();
      const { start, end } = todayWindow(schedule);

      let target;
      let label;

      if (now < start) {

        target = start;
        label = "Eating window opens in";
      } else if (now >= start && now < end) {
        target = end;
        label = "Fasting resumes in";
      } else {
        target = new Date(start);
        target.setDate(target.getDate() + 1);
        label = "Eating window opens in";
      }

      const diff = target - now;
      setReadout(`${label}  ${asHms(diff)}`);
    }, 1000);

    return () => clearInterval(id);
  }, [started, schedule]);

  const startFastHandler = () => {
    const { label, end, start } = wizardState.schedule;
    if (started) return;
    setWizardState((prev) => ({
      ...prev,
      fastStartedAt: Date.now(),
    }));
    setStarted(true);
    setSchedule({ label: label, start: start, end: end });
    startFast(wizardState.fastStartedAt);
  };

  const { start, end } = todayWindow(schedule);

  function goNext() {
    setWizardState((s) => ({ ...s, step: Math.min(s.step + 1, 2) }));
    authCxt.authenticate(token);
  }

  return (
    <ScrollView
      contentContainerStyle={styles(theme).container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles(theme).contentWrap}>
        <Title>Start your fasting schedule</Title>

        {/* <Image
          source={require("../../assets/clock.png")}
          style={styles(theme).image}
          resizeMode="contain"
        /> */}

        <Text style={styles(theme).scheduleLabel}>{schedule.label}</Text>
        <Text style={styles(theme).window}>{`${fmt(start)}  -  ${fmt(
          end
        )}`}</Text>

        {started && <Text style={styles(theme).countdown}>{readout}</Text>}
      </View>

      {!started ? (
        <PrimaryButton onPress={startFastHandler}>Start My Fast</PrimaryButton>
      ) : (
        <PrimaryButton onPress={goNext}>Next</PrimaryButton>
      )}
    </ScrollView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: "space-between",
      padding: 24,
    },
    contentWrap: {
      alignItems: "center",
    },
    image: {
      width: "100%",
      height: 220,
      borderRadius: 16,
      marginVertical: 24,
    },
    scheduleLabel: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.text,
      textAlign: "center",
    },
    window: {
      fontSize: 16,
      marginTop: 4,
      color: theme.muted,
      textAlign: "center",
    },
    countdown: {
      marginTop: 32,
      fontSize: 24,
      fontWeight: "700",
      color: theme.success,
      textAlign: "center",
    },
  });
