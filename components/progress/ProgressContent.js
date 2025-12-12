import { AnimatedCircularProgress } from "react-native-circular-progress";
import Title from "../ui/Title";
import { useContext, useMemo } from "react";
import { AppThemeContext } from "../../store/app-theme-context";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SubtitleText from "../ui/SubtitleText";
import Ads from "../../components/monetising/Ads";
import EventsChart from "./EventsChart";
import * as dt from "date-fns";

export default function MainProgess({
  fastingHours,
  selectedDay,
  defaultToday,
}) {
  const { theme, themeName } = useContext(AppThemeContext);
  const memoStyle = useMemo(() => styles(theme), [theme]);

  const day = selectedDay || defaultToday;

  return (
    <>
      <Title>{dt.format(day.date, "d MMM")}</Title>
      <AnimatedCircularProgress
        key={`${day.date}-${day.percent}`}
        size={250}
        width={50}
        fill={day.percent}
        tintColor={
          day.percent < 20
            ? theme.muted
            : day.percent > 20 && day.percent < 50
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
              left: center.x - 16,
              top: center.y - 16,
            }}
          />
        )}
      >
        {() => (
          <Text style={memoStyle.hours}>
            {Math.round(day.hoursFastedToday)}
            <Text style={memoStyle.unit}> HOURS</Text>
          </Text>
        )}
      </AnimatedCircularProgress>
      <View style={memoStyle.inner}>
        <SubtitleText style={memoStyle.text} size="xl">
          {themeName === "Desk" ? "Total:" : "Fasted Today:"}
        </SubtitleText>
        <Text style={memoStyle.hours}>
          {Math.round(day.hoursFastedToday)}
          <Text style={memoStyle.slashAndTotal}>/{fastingHours}</Text>
          <Text style={memoStyle.unit}> HOURS</Text>
        </Text>
      </View>
      {/*<Ads />*/}
      <EventsChart events={day.events} date={day.date} />
    </>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    mainProgress: {
      alignSelf: "center",
      marginVertical: 10,
    },
    hours: {
      fontSize: 32,
      fontWeight: "500",
      color: theme.primary200,
    },
    unit: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary200,
      textTransform: "uppercase",
    },
    inner: {
      alignItems: "flex-start",
      justifyContent: "center",
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
  });
