import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  Pressable,
} from "react-native";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import * as dt from "date-fns";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../store/app-theme-context";
import { useFasting } from "../../store/fastingLogic/fasting-context";

import WeeklyDonut from "../../components/progress/WeeklyDonut";

import ProgressCalendarModal from "../../modals/ProgressCalendarModal";
import useInterval from "../../util/useInterval";
import MainProgess from "../../components/progress/ProgressContent";
import useWeeklyStats from "../../store/fastingLogic/useWeeklyStats";
import {
  buildRecentWeekRanges,
  getWeekRange,
} from "../../util/progress/dateRanges";

function ProgressScreen() {
  const { theme } = useAppTheme();
  const { weeklyStats, refreshWeeklyStats } = useWeeklyStats();
  const { schedule, hoursFastedToday, events } = useFasting();
  const [, setNow] = useState(Date.now());
  const [openModal, setOpenModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [donutKey, setDonutKey] = useState(0);

  const navigation = useNavigation();

  const memoStyle = useMemo(() => styles(theme), [theme]);

  const handleWeekChange = useCallback(
    (start) => {
      navigation.setOptions({
        title: dt.format(start, "EEE do MMM"),
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
          hitSlop={10}
        >
          <Ionicons
            color={theme.text}
            name="calendar-clear-outline"
            size={22}
          />
        </Pressable>
      ),
    });
    const { start } = getWeekRange(new Date());
    handleWeekChange(start);
  }, [navigation, theme.text, handleWeekChange, memoStyle]);

  const scheduleFastingHours =
    schedule && schedule.fastingHours != null ? schedule.fastingHours : 0;
  const fastingHours = Math.max(scheduleFastingHours, 0);
  const percent = Math.min(
    100,
    Math.max(0, (hoursFastedToday / Math.max(fastingHours, 1)) * 100)
  );

  function handleDaySelect(dayData) {
    setSelectedDay(dayData);
  }

  const onRefresh = async () => {
    setRefreshing(true);

    const weeks = buildRecentWeekRanges(3);

    for (const w of weeks) {
      await refreshWeeklyStats(w.start, w.end);
    }

    // clear selection
    setSelectedDay(null);

    // force WeeklyDonut to remount and go back to initialScrollIndex=0
    setDonutKey((k) => k + 1);

    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={memoStyle.container}>
        <WeeklyDonut
          weeklyStats={weeklyStats}
          refreshWeeklyStats={refreshWeeklyStats}
          onWeekChange={handleWeekChange}
          onDaySelect={handleDaySelect}
          selectedDay={selectedDay}
          key={donutKey}
        />
        <MainProgess
          selectedDay={selectedDay}
          defaultToday={{
            percent,
            hoursFastedToday,
            fastingHours,
            events,
            date: new Date(),
          }}
          fastingHours={fastingHours}
        />
      </View>

      <ProgressCalendarModal
        showModal={openModal}
        onRequestClose={() => setOpenModal((prev) => !prev)}
        onDaySelect={handleDaySelect}
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
