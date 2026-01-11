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
import * as Notifications from "expo-notifications";
// import { usePremium } from "../../hooks/usePremium.js";
import FlatButton from "../../components/ui/FlatButton.js";
import { usePremium } from "../../store/premium-context.js";

export async function allowNotificationsAsync() {
  const settings = await Notifications.getPermissionsAsync();

  if (
    !settings.granted &&
    settings.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    settings = await Notifications.requestPermissionsAsync();
  }

  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

function TimerScreen({ navigation }) {
  const { schedule, isFasting, events, hoursFastedToday } = useFasting();
  const { theme, themeName } = useAppTheme();
  const memoStyle = useMemo(() => styles(theme, themeName), [theme, themeName]);
  const [readout, setReadout] = useState(null);
  const [offScheduleTitle, setOffScheduleTitle] = useState("");
  const { isPremium, loading } = usePremium();

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

  const inside = schedule ? stateAt(schedule, Date.now()) === "fasting" : false;

  const offSchedule = fasting !== inside;

  useEffect(() => {
    if (offSchedule) {
      setOffScheduleTitle(
        getRandomOffScheduleTitle(!fasting && inside ? "eating" : "fasting")
      );
    }
  }, [offSchedule, fasting, inside, events, hoursFastedToday]);

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
  });
