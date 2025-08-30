import { StyleSheet, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useAppTheme } from "../../store/app-theme-context";

function WeeklyDonut({ weeklyStats = [] }) {
  const { theme } = useAppTheme();
  const arc = 360 / 7;
  const stats = [...weeklyStats];
  console.log("weekly donut", weeklyStats);

  if (stats.length < 7) {
    const missing = 7 - stats.length;
    for (let i = 0; i < missing; i++) {
      stats.unshift({ percent: 0 });
    }
  }

  return (
    <View style={styles.container}>
      {stats.slice(0, 7).map((s, idx) => (
        <AnimatedCircularProgress
          key={idx}
          size={50}
          width={9}
          fill={Math.min(s.percent || 0, 100)}
          tintColor={theme.success}
          backgroundColor={theme.secondary100}
          lineCap="round"
          rotation={arc * idx}
          arcSweepAngle={arc}
          style={StyleSheet.absoluteFill}
        />
      ))}
    </View>
  );
}

export default WeeklyDonut;

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    alignSelf: "center",
    justifyContent: "center",
    // marginVertical: 20,
  },
});
