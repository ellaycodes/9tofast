import { StyleSheet, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { useMemo } from "react";
import { useAppTheme } from "../../store/app-theme-context";

function ButtonsContainer({ fast, withinFasting }) {
  const { startFast, endFast } = useFasting();
  const { setThemeName, themeName } = useAppTheme();

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

  function onAppThemeChange(themeName) {
    setThemeName(themeName);
  }

  return (
    <View style={styles.container}>
      <PrimaryButton style={styles.button} onPress={toggleFastHandler}>
        {buttonLabel}
      </PrimaryButton>
      {themeName === "desk" ? (
        <PrimaryButton
          style={styles.button}
          lowlight
          onPress={() => onAppThemeChange("original")}
        >
          Revert
        </PrimaryButton>
      ) : (
        <PrimaryButton
          style={styles.button}
          lowlight
          onPress={() => onAppThemeChange("desk")}
        >
          Desk Mode
        </PrimaryButton>
      )}
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
