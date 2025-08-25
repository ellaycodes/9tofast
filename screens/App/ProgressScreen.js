import { ScrollView, StyleSheet, View, Text } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Ads from "../../components/monetising/Ads";
import { useAppTheme } from "../../store/app-theme-context";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import { useEffect, useState } from "react";
import { getFastingSchedule } from "../../firebase/fasting.db.js";
import { auth } from "../../firebase/app";

function ProgressScreen() {
  const { theme } = useAppTheme();
  const { schedule, hoursFastedToday } = useFasting();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const percent = (hoursFastedToday / schedule?.fastingHours) * 100;

  return (
    <ScrollView>
      <View style={styles(theme).container}>
        <Title>Today's Fast</Title>
        <AnimatedCircularProgress
          size={250}
          width={60}
          fill={percent}
          tintColor={
            percent < 20
              ? theme.muted
              : percent > 20 && percent < 50
              ? theme.primary100
              : theme.success
          }
          backgroundColor={theme.secondary100}
          style={styles(theme).mainProgress}
          rotation={0}
          lineCap="round"
        />
        <View style={styles(theme).inner}>
          <SubtitleText style={styles(theme).text} size="xl">
            Fast
          </SubtitleText>
          <Text style={styles(theme).hours}>
            {Math.round(hoursFastedToday)}
            <Text style={styles(theme).slashAndTotal}>
              /{schedule?.fastingHours}
            </Text>
            <Text style={styles(theme).unit}> HOURS</Text>
          </Text>
        </View>
        <Ads />
      </View>
    </ScrollView>
  );
}

export default ProgressScreen;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 20,
    },
    mainProgress: {
      alignSelf: "center",
      marginVertical: 10,
    },
    inner: {
      alignItems: "left",
      justifyContent: "center",
    },
    hours: {
      fontSize: 32,
      fontWeight: "500",
      color: theme.primary200,
    },
    text: {
      textAlign: "left",
      padding: 0,
      margin: 0,
    },
    slashAndTotal: {
      fontSize: 32,
      fontWeight: "400",
      color: theme.primary200,
    },
    unit: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary200,
      textTransform: "uppercase",
    },
  });
