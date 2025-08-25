import { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { View } from "react-native";
import * as dt from "date-fns";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import Countdown from "../../components/ui/Countdown";
import { StyleSheet } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import { calcReadout } from "../../util/formatTime";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import ButtonsContainer from "../../components/ui/ButtonsContainer";
import Ads from "../../components/monetising/Ads";
import { getRandomOffScheduleTitle } from "../../util/offScheduleTitles";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { prefetchAvatars } from "../../assets/avatars";
import { getFastingSchedule } from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";
import { AuthContext } from "../../store/auth-context.js";

function TimerScreen({ navigation }) {
  const { schedule, isFasting } = useFasting();
  const authCxt = useContext(AuthContext)
  const { theme } = useAppTheme();
  const [readout, setReadout] = useState(null);
  const [offScheduleTitle, setOffScheduleTitle] = useState("");
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    if (!schedule) return;

    // (async () => await getFastingSchedule(authCxt.uid || auth?.currentUser?.uid))();
    
    const update = () => setReadout(calcReadout(schedule));
    update();

    const id = setInterval(update, 100);

    prefetchAvatars(12);

    return () => {
      clearInterval(id);
    };
  }, [schedule, isFasting()]);

  const withinFasting = useCallback(() => {
    if (!schedule) return false;

    const toMin = (h, m) => h * 60 + m;
    const [sh, sm] = schedule.start.split(":").map(Number);
    const [eh, em] = schedule.end.split(":").map(Number);

    const start = toMin(sh, sm);
    const end = toMin(eh, em);
    const now = toMin(new Date().getHours(), new Date().getMinutes());

    if (start < end) return now < start || now >= end;

    return now < start || now >= end;
  }, [schedule]);

  const offSchedule = isFasting() !== withinFasting();

  useEffect(() => {
    if (offSchedule) {
      setOffScheduleTitle(
        getRandomOffScheduleTitle(
          !isFasting() && withinFasting() ? "eating" : "fasting"
        )
      );
    }

    const id = setInterval(() => setTick(Date.now()), 100);

    return () => {
      clearInterval(id);
    };
  }, [offSchedule, isFasting(), withinFasting()]);

  const timeUnits = readout ? Object.keys(readout.units).slice(0, -1) : [];

  return schedule ? (
    <View style={styles(theme).container}>
      {!offSchedule ? (
        <Title
          style={[
            styles(theme).title,
            withinFasting() === offSchedule
              ? styles(theme).eating
              : styles(theme).fasting,
          ]}
        >
          {withinFasting() ? "Fasting Window" : "Eating Window"}
        </Title>
      ) : (
        <Title style={[styles(theme).title, styles(theme).eating]}>
          {offScheduleTitle}
        </Title>
      )}
      {offSchedule ? null : (
        <View style={styles(theme).countdownContainer}>
          {timeUnits.map((u) => (
            <Countdown key={u} label={u} time={readout.units[u]} />
          ))}
        </View>
      )}
      {offSchedule ? null : withinFasting() ? (
        <SubtitleText>
          Ends{" "}
          {schedule &&
            dt.format(dt.parse(schedule.start, "HH:mm", new Date()), "p")}
        </SubtitleText>
      ) : (
        <SubtitleText muted>
          Fasting Starts{" "}
          {schedule &&
            dt.format(dt.parse(schedule.end, "HH:mm", new Date()), "p")}
        </SubtitleText>
      )}
      <View>
        <ButtonsContainer fast={isFasting()} withinFasting={withinFasting()} />
      </View>
      <Ads />
    </View>
  ) : (
    <View style={[styles(theme).container, { justifyContent: "center" }]}>
      <PrimaryButton
        lowlight
        style={{ height: "50%" }}
        onPress={() =>
          navigation.navigate("Settings", { screen: "EditScheduleScreen" })
        }
      >
        Choose a Fasting Schedule
      </PrimaryButton>
    </View>
  );
}

export default TimerScreen;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 20,
    },
    countdownContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: "5%",
    },
    title: {
      marginBottom: 12,
    },
    fasting: {
      color: theme.error,
    },
    eating: {
      color: theme.success,
    },
    fastedContainer: {
      flexDirection: "row",
      margin: 16,
      gap: "10%",
    },
  });
