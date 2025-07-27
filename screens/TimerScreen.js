import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AuthContext } from "../store/auth-context";
import { useFasting } from "../store/fastingLogic/fasting-context";
import Countdown from "../components/ui/Countdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { AppThemeContext } from "../store/app-theme-context";
import { calcReadout, todayWindow, utcToUkLabel } from "../util/formatTime";
import Title from "../components/ui/Title";
import SubtitleText from "../components/ui/SubtitleText";
import PrimaryButton from "../components/ui/PrimaryButton";
import ButtonsContainer from "../components/ui/ButtonsContainer";
import { AntDesign } from "@expo/vector-icons";
import Ads from "../components/monetising/Ads";

function TimerScreen() {
  const { schedule, fastStartTime } = useFasting();
  const theme = Colors[useContext(AppThemeContext)];
  const [readout, setReadout] = useState(null);

  useEffect(() => {
    if (!schedule) return;

    const update = () => setReadout(calcReadout(schedule));
    update();

    const id = setInterval(update, 100);

    return () => clearInterval(id);
  }, [schedule]);

  const timeUnits = readout ? Object.keys(readout.units).slice(0, -1) : [];

  return (
    <View style={styles(theme).container}>
      {readout && readout.fast ? (
        <Title style={[styles(theme).title, styles(theme).fasting]}>
          Fasting Window
        </Title>
      ) : (
        <Title style={[styles(theme).title, styles(theme).eating]}>
          Eating Window
        </Title>
      )}
      <View style={styles(theme).countdownContainer}>
        {timeUnits.map((u) => (
          <Countdown key={u} label={u} time={readout.units[u]} />
        ))}
      </View>
      {readout && readout.fast ? (
        <SubtitleText>
          Starts {schedule && utcToUkLabel(schedule.start)}
        </SubtitleText>
      ) : (
        <SubtitleText muted>
          Ends {schedule && utcToUkLabel(schedule.end)}
        </SubtitleText>
      )}
      <View>
        <ButtonsContainer fast={readout && readout.fast} />
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
  });
