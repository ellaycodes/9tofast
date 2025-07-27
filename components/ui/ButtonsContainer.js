import { StyleSheet, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { msToHms } from "../../util/formatTime";

function ButtonsContainer({ fast }) {
  const { fastStartTime, startFast } = useFasting();

  function startFastHandler() {
    startFast()
  }

  return (
    <View style={styles.container}>
      <PrimaryButton style={styles.button} onPress={startFastHandler}>
        {fast ? "End Fast" : "Start Fast"}
      </PrimaryButton>
      <PrimaryButton style={styles.button} lowlight>
        Pause
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
