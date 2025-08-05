import { useEffect, useState, useMemo } from "react";
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

function TimerScreen({ navigation }) {
  const { schedule, isFasting } = useFasting();
  const { theme } = useAppTheme();
  const [readout, setReadout] = useState(null);
  const [offScheduleTitle, setOffScheduleTitle] = useState("");

  useEffect(() => {
    if (!schedule) return;

    const update = () => setReadout(calcReadout(schedule));
    update();

    const id = setInterval(update, 100);

    return () => {
      clearInterval(id);
    };
  }, [schedule, isFasting]);

  const withinFasting = useMemo(() => {
    if (!schedule) return false;
    const now = Date.now();

    // parse the eating‑window times from your ISO schedule
    const startTOD = dt.parse(schedule.start, "HH:mm", new Date());
    const endTOD = dt.parse(schedule.end, "HH:mm", new Date());

    // build two timestamps for *today* at those times
    const today = new Date(now);
    const eatStartTs = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      startTOD.getHours(),
      startTOD.getMinutes(),
      startTOD.getSeconds()
    ).getTime();

    const eatEndTs = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      endTOD.getHours(),
      endTOD.getMinutes(),
      endTOD.getSeconds()
    ).getTime();

    // fasting is any time before eating starts or after eating ends
    return now < eatStartTs || now >= eatEndTs;
  }, [schedule]);

  const offSchedule =
    (isFasting() && !withinFasting) || (!isFasting() && withinFasting);

  useEffect(() => {
    if (offSchedule) {
      setOffScheduleTitle(
        getRandomOffScheduleTitle(
          !isFasting() && withinFasting ? "eating" : "fasting"
        )
      );
    }
  }, [offSchedule, isFasting, withinFasting]);

  const timeUnits = readout ? Object.keys(readout.units).slice(0, -1) : [];

  return schedule ? (
    <View style={styles(theme).container}>
      {!offSchedule ? (
        <Title
          style={[
            styles(theme).title,
            withinFasting === offSchedule
              ? styles(theme).eating
              : styles(theme).fasting,
          ]}
        >
          {withinFasting ? "Fasting Window" : "Eating Window"}
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
      {offSchedule ? null : withinFasting ? (
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
        <ButtonsContainer fast={isFasting()} withinFasting={withinFasting} />
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
