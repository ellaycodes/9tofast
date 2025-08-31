import { ScrollView, StyleSheet, View, Text, Pressable } from "react-native";
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
import * as dt from "date-fns";
import EventsChart from "../../components/progress/EventsChart";

function ProgressScreen() {
  const { theme } = useAppTheme();
  const { schedule, hoursFastedToday, events } = useFasting();
  const [now, setNow] = useState(Date.now());
  const { weeklyStats } = useWeeklyStats();
  const [openModal, setOpenModal] = useState(false);
  const navigation = useNavigation();

  const handleWeekChange = (start, end) => {
    navigation.setOptions({
      title: `${dt.format(start, "d MMM")} - ${dt.format(end, "d MMM")}`,
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setOpenModal(!openModal)}
          style={{ paddingHorizontal: 10, flex: 1}}
        >
          <Ionicons
            color={theme.text}
            name="calendar-clear-outline"
            size={22}
          />
        </Pressable>
      ),
    });
    const start = dt.startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = dt.endOfWeek(start, { weekStartsOn: 0 });
    handleWeekChange(start, end);
    return () => clearInterval(timer);
  }, [navigation, theme.text]);

  const fastingHours =
    typeof schedule?.fastingHours === "number" && schedule.fastingHours > 0
      ? schedule.fastingHours
      : 0;
  const percent = (hoursFastedToday / (fastingHours || 1)) * 100;

  return (
    <ScrollView>
      <View style={styles(theme).container}>
        <WeeklyDonut onWeekChange={handleWeekChange} />
        <Title>Today, {dt.format(new Date(), "d MMM")}</Title>
        <AnimatedCircularProgress
          size={250}
          width={50}
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
          duration={2000}
          renderCap={({ center }) => (
            <Ionicons
              name="flame"
              size={36}
              color={theme.secondary200}
              style={{
                position: "absolute",
                left: center.x - 12,
                top: center.y - 10,
              }}
            />
          )}
        >
          {() => (
            <Text style={styles(theme).hours}>
              {Math.round(hoursFastedToday)}
              <Text style={styles(theme).unit}> HOURS</Text>
            </Text>
          )}
        </AnimatedCircularProgress>
        <View style={styles(theme).inner}>
          <SubtitleText style={styles(theme).text} size="xl">
            Fasted
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
        <EventsChart events={events} />
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
      fontWeight: "bold",
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
