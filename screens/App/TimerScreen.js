import { useEffect, useState, useCallback, useContext } from "react";
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

function TimerScreen({ navigation }) {
  const { schedule, isFasting, events, hoursFastedToday } = useFasting();
  const { theme } = useAppTheme();
  const [readout, setReadout] = useState(null);
  const [offScheduleTitle, setOffScheduleTitle] = useState("");

  const fasting = isFasting();

  useEffect(() => {
    if (!schedule) return;

    const update = () => setReadout(calcReadout(schedule));
    update();

    const id = setInterval(update, 100);

    prefetchAvatars(12);

    return () => {
      clearInterval(id);
    };
  }, [schedule, fasting]);

  const withinFasting = useCallback(() => {
    if (!schedule) return false;

    const toMin = (h, m) => h * 60 + m;
    const [sh, sm] = schedule.start.split(":").map(Number);
    const [eh, em] = schedule.end.split(":").map(Number);

    const start = toMin(sh, sm);
    const end = toMin(eh, em);
    const now = toMin(new Date().getHours(), new Date().getMinutes());

    if (start < end) return now < start || now >= end;

    return now >= start || now < end;
  }, [schedule]);

  const inside = withinFasting();

  const offSchedule = fasting !== inside;

  useEffect(() => {
    console.log('events', events, 'hoursFastedToday', hoursFastedToday);

    if (offSchedule) {
      setOffScheduleTitle(
        getRandomOffScheduleTitle(!fasting && inside ? "eating" : "fasting")
      );
    }
  }, [offSchedule, fasting, inside, events, hoursFastedToday]);

  const timeUnits = readout ? Object.keys(readout.units).slice(0, -1) : [];

  return schedule ? (
    <View style={styles(theme).container}>
      {!offSchedule ? (
        <Title
          style={[
            styles(theme).title,
            inside === offSchedule
              ? styles(theme).eating
              : styles(theme).fasting,
          ]}
        >
          {inside ? "Fasting Window" : "Eating Window"}
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
      {offSchedule ? null : inside ? (
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
        <ButtonsContainer fast={fasting} withinFasting={inside} />
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
