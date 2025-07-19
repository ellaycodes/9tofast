import { StyleSheet, Text, View } from "react-native";
import CarouselButton from "../components/ui/CarouselButton";
import PrimaryButton from "../components/ui/PrimaryButton";
import Title from "../components/ui/Title";
import { Colors } from "../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../store/app-theme-context";

function OnboardingCarousel() {
  const theme = Colors[useContext(AppThemeContext)];
  return (
    <View style={styles(theme).container}>
      <View>
        <View style={styles(theme).progressBar}></View>
        <View>
          <Title>Choose your Fasting Schedule</Title>
        </View>
        <View>
          <CarouselButton>
            Skip Breakfast 16:8 (12pm - 8pm)
          </CarouselButton>
          <CarouselButton>Work-Lunch Window 14:10(9am - 7pm)</CarouselButton>
          <CarouselButton>After Hours Fast 18:6 (1pm - 7pm)</CarouselButton>
          <CarouselButton>Custom</CarouselButton>
        </View>
      </View>
      <View>
        <PrimaryButton>Next</PrimaryButton>
      </View>
    </View>
  );
}

export default OnboardingCarousel;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      // backgroundColor: "#ffc7c7",
      flex: 1,
      justifyContent: "space-between",
      margin: 16,
    }
  });
