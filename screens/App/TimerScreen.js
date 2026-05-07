import { useEffect, useState, useMemo } from "react";
import { Text, View } from "react-native";
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
import { stateAt } from "../../store/fastingLogic/scheduler";
import Streaks from "../../components/Home/Streaks.js";
import FlatButton from "../../components/ui/FlatButton.js";
import { usePremium } from "../../store/premium-context.js";
import {
  getTodayConfig,
  getDayKey,
} from "../../store/fastingLogic/data/weekly-schedule.js";
import { getScheduleTimeZone } from "../../util/timezone.js";

function TimerScreen({ navigation }) {
  const { schedule, weeklySchedule, isFasting, hoursFastedToday } =
    useFasting();
  const { theme, themeName } = useAppTheme();
  const memoStyle = useMemo(() => styles(theme, themeName), [theme, themeName]);
  const [readout, setReadout] = useState(null);
  const [offScheduleTitle, setOffScheduleTitle] = useState("");
  const { isPremium, loading } = usePremium();

  const fasting = isFasting();

  // Resolve today's config and timezone from whichever model is available
  const timeZone = schedule
    ? getScheduleTimeZone(schedule)
    : weeklySchedule?.timeZone ?? undefined;

  const todayConfig = weeklySchedule ? getTodayConfig(weeklySchedule, timeZone) : null;
  const isRestDay = todayConfig?.type === "rest";

  // Day label for the active-window line (e.g. "Monday")
  const dayLabel = timeZone
    ? new Intl.DateTimeFormat("en-US", {
        timeZone,
        weekday: "long",
      }).format(new Date())
    : "";

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

  const inside = schedule ? stateAt(schedule, Date.now()) === "fasting" : false;
  const offSchedule = fasting !== inside;

  useEffect(() => {
    if (offSchedule) {
      setOffScheduleTitle(
        getRandomOffScheduleTitle(!fasting && inside ? "eating" : "fasting")
      );
    }
  }, [offSchedule, fasting, inside, hoursFastedToday]);

  const timeUnits = readout ? Object.keys(readout.units).slice(0, -1) : [];

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles(theme, themeName).streaks}>
          <Streaks />
        </View>
      ),
    });
  }, []);

  const label =
    themeName === "Desk"
      ? offSchedule
        ? "Off-Schedule"
        : "On-Schedule"
      : inside
      ? "Fasting Window"
      : "Eating Window";

  // Active-day window line shown below the subtitle
  const windowLine = isRestDay
    ? `${dayLabel} · Rest Day`
    : schedule
    ? `${dayLabel} · ${dt.format(
        dt.parse(schedule.start, "HH:mm", new Date()),
        "p"
      )} – ${dt.format(dt.parse(schedule.end, "HH:mm", new Date()), "p")}`
    : null;

  // Rest Day state — no schedule but a weekly schedule has today as rest
  if (isRestDay && !schedule) {
    return (
      <View style={[memoStyle.container, memoStyle.centeredContent]}>
        <Title style={[memoStyle.title, memoStyle.eating]}>Rest Day</Title>
        <SubtitleText muted>Enjoy your rest — no fasting goal today</SubtitleText>
        <View style={memoStyle.buttonsContainer}>
          <ButtonsContainer fast={fasting} withinFasting={false} />
        </View>
      </View>
    );
  }

  return schedule ? (
    <View style={memoStyle.container}>
      {!offSchedule ? (
        <Title
          style={[
            memoStyle.title,
            inside === offSchedule ? memoStyle.eating : memoStyle.fasting,
          ]}
        >
          {label}
        </Title>
      ) : (
        <Title style={[memoStyle.title, memoStyle.fasting]}>
          {themeName === "Desk" ? label : offScheduleTitle}
        </Title>
      )}
      {offSchedule ? null : (
        <View style={memoStyle.countdownContainer}>
          {timeUnits.map((u) => (
            <Countdown key={u} label={u} time={readout.units[u]} />
          ))}
        </View>
      )}
      {offSchedule ? null : inside ? (
        <SubtitleText>
          {themeName === "Desk" ? "Next Window " : "Fasting Ends "}
          {schedule &&
            dt.format(dt.parse(schedule.start, "HH:mm", new Date()), "p")}
        </SubtitleText>
      ) : (
        <SubtitleText muted>
          {themeName === "Desk" ? "Next Window " : "Fasting Starts "}
          {schedule &&
            dt.format(dt.parse(schedule.end, "HH:mm", new Date()), "p")}
        </SubtitleText>
      )}
      {windowLine && !offSchedule && (
        <Text style={memoStyle.windowLine}>{windowLine}</Text>
      )}
      <Ads disabled={isPremium || loading} />
      <View style={memoStyle.buttonsContainer}>
        <ButtonsContainer fast={fasting} withinFasting={inside} />
      </View>
    </View>
  ) : (
    <View style={[memoStyle.container, { justifyContent: "center" }]}>
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

const styles = (theme, themeName) =>
  StyleSheet.create({
    container: {
      // marginHorizontal: 20,
    },
    centeredContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    countdownContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: "5%",
      marginHorizontal: 20,
    },
    title: {
      marginBottom: 12,
      ...(themeName === "Desk" && {
        textAlign: "left",
        paddingLeft: 12,
        paddingBottom: 0,
        alignItems: "left",
        fontSize: 14,
        marginTop: 12,
      }),
    },
    buttonsContainer: {
      marginHorizontal: 20,
    },
    fasting: {
      color: theme.error,
    },
    eating: {
      color: theme.success,
    },
    streaks: {
      paddingHorizontal: 30,
    },
    windowLine: {
      textAlign: "center",
      fontSize: 13,
      color: theme.muted,
      marginTop: 6,
      marginBottom: 8,
    },
  });
