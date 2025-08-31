import { ScrollView, StyleSheet, View, Text, Pressable } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Ads from "../../components/monetising/Ads";
import { useAppTheme } from "../../store/app-theme-context";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import { useCallback, useEffect, useState, useMemo } from "react";
import WeeklyDonut from "../../components/progress/WeeklyDonut";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ProgressCalendarModal from "../../modals/ProgressCalendarModal";
import * as dt from "date-fns";
import EventsChart from "../../components/progress/EventsChart";
import useInterval from "../../util/useInterval";

function ProgressScreen() {
  const { theme } = useAppTheme();
  const { schedule, hoursFastedToday, events } = useFasting();
  const [, setNow] = useState(Date.now());
  const [openModal, setOpenModal] = useState(false);
  const navigation = useNavigation();

  const memoStyle = useMemo(() => styles(theme), [theme]);

  const handleWeekChange = useCallback(
    (start, end) => {
      navigation.setOptions({
        title: `${dt.format(start, "d MMM")} - ${dt.format(end, "d MMM")}`,
      });
    },
    [navigation]
  );

  useInterval(() => setNow(Date.now()), 60_000);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open progress calendar"
          onPress={() => setOpenModal((prev) => !prev)}
          style={memoStyle.headerButton}
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
  }, [navigation, theme.text, handleWeekChange, memoStyle]);

  const fastingHours = Math.max(schedule?.fastingHours ?? 0, 0);
  const percent = Math.min(
    100,
    Math.max(0, (hoursFastedToday / Math.max(fastingHours, 1)) * 100)
  );

  return (
    <ScrollView>
      <View style={memoStyle.container}>
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
          style={memoStyle.mainProgress}
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
            <Text style={memoStyle.hours}>
              {Math.round(hoursFastedToday)}
              <Text style={memoStyle.unit}> HOURS</Text>
            </Text>
          )}
        </AnimatedCircularProgress>
        <View style={memoStyle.inner}>
          <SubtitleText style={memoStyle.text} size="xl">
            Fasted
          </SubtitleText>
          <Text style={memoStyle.hours}>
            {Math.round(hoursFastedToday)}
            <Text style={memoStyle.slashAndTotal}>
              /{schedule?.fastingHours}
            </Text>
            <Text style={memoStyle.unit}> HOURS</Text>
          </Text>
        </View>
        <Ads />
        <EventsChart events={events} />
      </View>

      <ProgressCalendarModal
        showModal={openModal}
        onRequestClose={() => setOpenModal((prev) => !prev)}
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
    headerButton: {
      paddingHorizontal: 10,
      flex: 1,
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
