import { StyleSheet, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { useMemo } from "react";

function ButtonsContainer({ fast, withinFasting }) {
  const { startFast, endFast } = useFasting();

  function toggleFastHandler() {
    fast ? endFast() : startFast();
  }

  const buttonLabel = useMemo(() => {
    if (fast && withinFasting) {
      return "Pause Fast";
    }
    if (fast && !withinFasting) {
      return "Resume Eating";
    }
    if (!fast && withinFasting) {
      return "Resume Fasting";
    }

    return "Start Fast Early";
  }, [fast, withinFasting]);

  return (
    <View style={styles.container}>
      <PrimaryButton style={styles.button} onPress={toggleFastHandler}>
        {buttonLabel}
      </PrimaryButton>
      <PrimaryButton style={styles.button} lowlight>
        Desk Mode
      </PrimaryButton>
    </View>
  );
}

export default ButtonsContainer;

const styles = StyleSheet.create({
  container: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flexBasis: "45%",
    flexGrow: 1,
    margin: 4,
  },
});
