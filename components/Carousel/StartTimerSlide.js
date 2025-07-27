import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

import Title from "../ui/Title";
import PrimaryButton from "../ui/PrimaryButton";
import { Colors } from "../../constants/Colors";
import { AppThemeContext } from "../../store/app-theme-context";
import { AuthContext } from "../../store/auth-context";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import {
  calcReadout,
  todayWindow,
  msToHms,
  formatTime,
} from "../../util/formatTime";

export default function StartTimerSlide({ setWizardState, token }) {
  const theme = Colors[useContext(AppThemeContext)];
  const authCxt = useContext(AuthContext);
  const { setSchedule, startFast, schedule, endFast } = useFasting();
  console.log("\nschedule", schedule);

  const [started, setStarted] = useState(false);
  const [readout, setReadout] = useState("\u00A0"); // non‑breaking space as placeholder

  useEffect(() => {
    if (!started) {
      setReadout(null);
      return;
    }

    const update = () => {
      const c = calcReadout(schedule);
      setReadout(`${c.label} ${msToHms(c.diffMs)}`);
    };

    update();

    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, [started, schedule]);

  const startFastHandler = () => {
    if (started) return;

    const now = Date.now();
    const startTs = new Date(schedule.start).getTime();
    const endTs = new Date(schedule.end).getTime();

    if (now >= startTs && now < endTs) {
      endFast(now);
    } else {
      startFast(now);
    }
    setSchedule(schedule);
    setStarted(true);
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
        <Text style={styles(theme).window}>{`${formatTime(
          start
        )}  -  ${formatTime(end)}`}</Text>

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
