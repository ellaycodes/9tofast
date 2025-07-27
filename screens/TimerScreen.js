import { useEffect, useState, useMemo } from "react";
import { View } from "react-native";
import { useFasting } from "../store/fastingLogic/fasting-context";
import Countdown from "../components/ui/Countdown";
import { StyleSheet } from "react-native";
import { useAppTheme } from "../store/app-theme-context";
import { calcReadout, utcToUkLabel } from "../util/formatTime";
import Title from "../components/ui/Title";
import SubtitleText from "../components/ui/SubtitleText";
import ButtonsContainer from "../components/ui/ButtonsContainer";
import Ads from "../components/monetising/Ads";
import { getRandomOffScheduleTitle } from "../util/offScheduleTitles";

function TimerScreen() {
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
  }, [schedule]);

  const withinFasting = useMemo(() => {
    if (!schedule) return false;
    const now = Date.now();
    const startTs = new Date(schedule.start).getTime();
    const endTs = new Date(schedule.end).getTime();
    return now < startTs || now >= endTs;
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

  return (
    <View style={styles(theme).container}>
      {isFasting() && !offSchedule ? (
        <Title style={[styles(theme).title, styles(theme).fasting]}>
          Fasting Window
        </Title>
      ) : !isFasting() && !offSchedule ? (
        <Title style={[styles(theme).title, styles(theme).eating]}>
          Eating Window
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
      {!isFasting() && withinFasting ? (
        <SubtitleText muted>Allowed Snack Time 🍪</SubtitleText>
      ) : isFasting() ? (
        <SubtitleText>
          Ends {schedule && utcToUkLabel(schedule.start)}
        </SubtitleText>
      ) : (
        <SubtitleText muted>
          Fasting Starts {schedule && utcToUkLabel(schedule.end)}
        </SubtitleText>
      )}
      <View>
        <ButtonsContainer fast={isFasting()} withinFasting={withinFasting} />
      </View>
      <Ads />
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
