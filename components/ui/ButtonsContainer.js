import { StyleSheet, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";

function ButtonsContainer({ fast }) {
  const { startFast, endFast } = useFasting();

  function toggleFastHandler() {
    if (fast) {
      endFast();
      fast = false;
    } else {
      startFast();
      fast = true;
    }
  }

  return (
    <View style={styles.container}>
      <PrimaryButton style={styles.button} onPress={toggleFastHandler}>
        {fast ? "End Fast" : "Start Fast Early"}
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
