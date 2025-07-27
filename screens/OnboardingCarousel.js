import { useState } from "react";
import ScheduleSlide from "../components/Carousel/ScheduleSlide";
import StartTimerSlide from "../components/Carousel/StartTimerSlide";
import { StyleSheet, View } from "react-native";
import ProgressDots from "../components/Carousel/ProgressDots";

function OnboardingCarousel({ route }) {
  const { token } = route.params;
  const [wizardState, setWizardState] = useState({
    step: 0,
    events: [],
  });

  const slides = [
    <ScheduleSlide {...{ wizardState, setWizardState }} />,
    <StartTimerSlide {...{ wizardState, setWizardState, token }} />,
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
