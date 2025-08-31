import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Ads from "../../components/monetising/Ads";
import { useAppTheme } from "../../store/app-theme-context";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import { useEffect, useState } from "react";
import useWeeklyStats from "../../store/fastingLogic/useWeeklyStats";
import WeeklyDonut from "../../components/progress/WeeklyDonut";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ProgressCalendarModal from "../../modals/ProgressCalendarModal";
import * as dt from 'date-fns'

function ProgressScreen() {
  const { theme } = useAppTheme();
  const { schedule, hoursFastedToday } = useFasting();
  const [now, setNow] = useState(Date.now());
  const { weeklyStats } = useWeeklyStats();
  const [openModal, setOpenModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => setOpenModal(!openModal)}>
          <Ionicons
            color={theme.text}
            name="calendar-clear-outline"
            size={22}
          />
        </Pressable>
      ),
      title: `${dt.format(new Date(), 'PPPP')}`
    });
    return () => clearInterval(timer);
  }, [navigation]);

  const fastingHours =
    typeof schedule?.fastingHours === "number" && schedule.fastingHours > 0
      ? schedule.fastingHours
      : 0;
  const percent = (hoursFastedToday / (fastingHours || 1)) * 100;

  return (
    <ScrollView>
      <View style={styles(theme).container}>
        <WeeklyDonut weeklyStats={weeklyStats} />
        {/* <Title>Today</Title> */}
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

      <ProgressCalendarModal
        showModal={openModal}
        onRequestClose={() => setOpenModal(!openModal)}
      />
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
      alignItems: "flex-start",
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
