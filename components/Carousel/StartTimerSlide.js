import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

import Title from "../ui/Title";
import PrimaryButton from "../ui/PrimaryButton";
import { Colors } from "../../constants/Colors";
import { AppThemeContext } from "../../store/app-theme-context";
import { AuthContext } from "../../store/auth-context";

/**
 * StartTimerSlide – second page in the onboarding wizard.
 *
 * Props expected from the wizard shell:
 *   wizardState      – { schedule: { label, start, end }, fastStartedAt, step }
 *   setWizardState   – setter passed down from the Wizard parent
 *
 * Behaviour:
 *   • Shows the user‑selected schedule (label + window).
 *   • "Start My Fast" button writes `fastStartedAt` and flips to a live
 *     countdown. The countdown updates every second and figures out whether
 *     we are waiting for the EATING window to open or for FASTING to resume
 *     based on the current clock.
 *   • Uses ScrollView with `contentContainerStyle` so `justifyContent: 'space‑between'`
 *     still works when the screen is short/tall.
 */

export default function StartTimerSlide({
  wizardState,
  setWizardState,
  token,
}) {
  const themeName = useContext(AppThemeContext);
  const theme = Colors[themeName];
  const authCxt = useContext(AuthContext);

  const { schedule } = wizardState;
  /** We allow the component to re‑render when the fast starts so we can hide
   *  the button and show a live countdown. */
  const [started, setStarted] = useState(!!wizardState.fastStartedAt);
  const [readout, setReadout] = useState("\u00A0"); // non‑breaking space as placeholder

  /* ------------------------------------------------------------ */
  /*  Helpers                                                     */
  /* ------------------------------------------------------------ */

  // Create Date objects for *today's* start & end window.
  const todayWindow = () => {
    const now = new Date();

    const start = new Date(schedule.start);
    const end = new Date(schedule.end);

    // pull today’s Y‑M‑D into both dates so they line up with today
    start.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    end.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

    // If the window spans midnight (end < start), push `end` to tomorrow
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
    return { start, end };
  };

  // Format HH:mm in 24‑hour UK style.
  const fmt = (d) =>
    d.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
    });

  // Turn milliseconds → "hh:mm:ss"
  const asHms = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  /* ------------------------------------------------------------ */
  /*  Countdown logic                                             */
  /* ------------------------------------------------------------ */

  useEffect(() => {
    if (!started) return; // no timer yet

    const id = setInterval(() => {
      const now = new Date();
      const { start, end } = todayWindow();

      let target;
      let label;

      if (now < start) {
        // we are still fasting → waiting for eating window
        target = start;
        label = "Eating window opens in";
      } else if (now >= start && now < end) {
        // we are in eating window → waiting for fast to resume
        target = end;
        label = "Fasting resumes in";
      } else {
        // after end → next eating window is tomorrow
        target = new Date(start);
        target.setDate(target.getDate() + 1);
        label = "Eating window opens in";
      }

      const diff = target - now;
      setReadout(`${label}  ${asHms(diff)}`);
    }, 1000);

    return () => clearInterval(id);
  }, [started, schedule]);

  /* ------------------------------------------------------------ */
  /*  Handlers                                                    */
  /* ------------------------------------------------------------ */

  const startFast = () => {
    if (started) return;
    setWizardState((prev) => ({
      ...prev,
      fastStartedAt: Date.now(),
    }));
    setStarted(true);
  };

  const { start, end } = todayWindow();

  function goNext() {
    console.log(wizardState);
    setWizardState((s) => ({ ...s, step: Math.min(s.step + 1, 2) }));
    authCxt.authenticate(token)
    console.log(token);
  }

  /* ------------------------------------------------------------ */
  /*  Render                                                      */
  /* ------------------------------------------------------------ */

  return (
    <ScrollView
      contentContainerStyle={styles(theme).container}
      showsVerticalScrollIndicator={false}
    >
      {/* TOP half */}
      <View style={styles(theme).contentWrap}>
        <Title>Start your fasting schedule</Title>

        {/* Replace the source with whatever image asset lives in your project */}
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

      {/* BOTTOM CTA */}
      {!started ? (
        <PrimaryButton onPress={startFast}>Start My Fast</PrimaryButton>
      ) : (
        <PrimaryButton onPress={goNext}>Next</PrimaryButton>
      )}
    </ScrollView>
  );
}

/* -------------------------------------------------------------- */
/*  Styles                                                        */
/* -------------------------------------------------------------- */

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: "space-between", // so CTA sticks to bottom when content is short
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
