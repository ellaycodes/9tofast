import { ScrollView, StyleSheet, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Ads from "../../components/monetising/Ads";
import { useAppTheme } from "../../store/app-theme-context";

function ProgressScreen() {
  const { theme } = useAppTheme();
  return (
    <ScrollView>
      <View style={styles(theme).container}>
        <AnimatedCircularProgress
          size={200}
          width={20}
          fill={40}
          tintColor={theme.success}
          onAnimationComplete={() => console.log("onAnimationComplete")}
          backgroundColor={theme.secondary100}
          style={styles(theme).mainProgress}
        />
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
      marginVertical: 10
    },
  });
