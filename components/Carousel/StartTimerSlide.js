import { useContext, useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { parse, startOfDay } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";

import Title from "../ui/Title";
import PrimaryButton from "../ui/PrimaryButton";
import { useAppTheme } from "../../store/app-theme-context";
import { AuthContext } from "../../store/auth-context";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { auth } from "../../firebase/app";
import { 
  calcReadout, 
  msToHms 
} from "../../util/formatTime";

export default function StartTimerSlide({ setWizardState, token, userName, localId }) {
  const { theme } = useAppTheme();
  const authCxt = useContext(AuthContext);
  const { setSchedule, startFast, schedule, endFast, setBaselineAnchor } = useFasting();

  const [started, setStarted] = useState(false);
  const [readout, setReadout] = useState("\u00A0"); // non‑breaking space as placeholder
  const [authReady, setAuthReady] = useState(false);
  const pendingStartRef = useRef();

  // Authenticate immediately so subsequent events persist remotely
  useEffect(() => {
    authCxt.authenticate(token, userName, localId);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthReady(true);
        unsub();
      }
    });
    return unsub;
  }, [authCxt, token, userName, localId]);

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
    
    const run = () => {
      const now = Date.now();
      setBaselineAnchor(now);

      // decide current window and flip once
      const todayMidnight = startOfDay(new Date());
      const startTs = parse(schedule.start, "HH:mm", todayMidnight).getTime();
      const endTs = parse(schedule.end, "HH:mm", todayMidnight).getTime();

      let inEatingWindow;
      if (startTs < endTs) {
        inEatingWindow = now >= startTs && now < endTs;
      } else {
        inEatingWindow = now >= startTs || now < endTs;
      }

      if (inEatingWindow) {
        endFast("manual");
      } else {
        startFast("manual");
      }

      setSchedule(schedule);
      setStarted(true);
    };

    if (authReady) {
      run();
    } else {
      pendingStartRef.current = run;
    }
  };

  useEffect(() => {
    if (authReady && pendingStartRef.current) {
      pendingStartRef.current();
      pendingStartRef.current = null;
    }
  }, [authReady]);

  function goNext() {
    authCxt.completeOnboarding();
    setWizardState((s) => ({ ...s, step: Math.min(s.step + 1, 2) }));
  }

  return (
    <ScrollView
      contentContainerStyle={styles(theme).container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles(theme).contentWrap}>
        <Title>Start your fasting schedule</Title>
        <Text style={styles(theme).scheduleLabel}>{schedule.label}</Text>
        <Text
          style={styles(theme).window}
        >{`${schedule.start}  -  ${schedule.end}`}</Text>

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
