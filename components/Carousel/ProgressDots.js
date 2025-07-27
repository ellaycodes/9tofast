import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function ProgressDots({ step, total }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dots,
            {
              backgroundColor: i === step ? theme.primary100 : theme.primary500,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default ProgressDots;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  dots: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
