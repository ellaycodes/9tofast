import { Colors } from "../constants/Colors";
import { useContext, useState } from "react";
import { AppThemeContext } from "../store/app-theme-context";
import ScheduleSlide from "../components/Carousel/ScheduleSlide";
import StartTimerSlide from "../components/Carousel/StartTimerSlide";
import StatsIntroSlide from "../components/Carousel/StatsIntroSlide";
import { StyleSheet, View } from "react-native";
import ProgressDots from "../components/Carousel/ProgressDots";

function OnboardingCarousel() {
  const theme = Colors[useContext(AppThemeContext)];
  const [wizardState, setWizardState] = useState({
    step: 0,
    schedule: null,
    fastStartedAt: null,
  });

  const slides = [
    <ScheduleSlide {...{ wizardState, setWizardState }} />,
    <StartTimerSlide {...{ wizardState, setWizardState }} />,
    <StatsIntroSlide {...{ wizardState, setWizardState }} />,
  ];

  return (
    <View style={styles.container}>
      <ProgressDots step={wizardState.step} total={slides.length} />
      {slides[wizardState.step]}
    </View>
  );
}

export default OnboardingCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
