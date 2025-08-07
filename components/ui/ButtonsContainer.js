import { StyleSheet, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { useMemo, useState } from "react";
import { useAppTheme } from "../../store/app-theme-context";

function ButtonsContainer({ withinFasting }) {
  const { startFast, endFast, isFasting } = useFasting();
  const { setThemeName, themeName } = useAppTheme();
  const [tempTheme, setTempTheme] = useState(null);

  function toggleFastHandler() {
    isFasting() ? endFast('manual') : startFast('manual');
  }
  

  const buttonLabel = useMemo(() => {
    if (isFasting() && withinFasting) {
      return "Pause Fast";
    }
    if (isFasting() && !withinFasting) {
      return "Resume Eating";
    }
    if (!isFasting() && withinFasting) {
      return "Resume Fasting";
    }

    return "Start Fast Early";
  }, [isFasting(), withinFasting]);

  function onAppThemeChange() {
    if (themeName !== "Desk") {
      setTempTheme(themeName);
      setThemeName("Desk");
    } else {
      setThemeName(tempTheme || "Original");
      setTempTheme(null);
    }
  }

  return (
    <View style={styles.container}>
      <PrimaryButton style={styles.button} onPress={toggleFastHandler}>
        {buttonLabel}
      </PrimaryButton>
      {themeName === "Desk" ? (
        <PrimaryButton
          style={styles.button}
          lowlight
          onPress={() => onAppThemeChange(themeName)}
        >
          Revert
        </PrimaryButton>
      ) : (
        <PrimaryButton
          style={styles.button}
          lowlight
          onPress={() => onAppThemeChange("Desk")}
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
