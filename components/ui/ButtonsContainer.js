import { StyleSheet, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import { useMemo, useState } from "react";
import { useAppTheme } from "../../store/app-theme-context";
import { Ionicons } from "@expo/vector-icons";

function ButtonsContainer({ withinFasting }) {
  const { startFast, endFast, isFasting } = useFasting();
  const { setThemeName, themeName, theme } = useAppTheme();
  const [tempTheme, setTempTheme] = useState(null);

  async function toggleFastHandler() {
    if (isFasting()) {
      await endFast("manual");
    } else {
      await startFast("manual");
    }
  }

  const fasting = isFasting();

  const buttonLabel = useMemo(() => {
    if (fasting && withinFasting) {
      return <Ionicons name="pause" size={30} color={theme.background} />;
    }
    if (fasting && !withinFasting) {
      return <Ionicons name="play" size={30} color={theme.background} />;
    }
    if (!fasting && withinFasting) {
      return <Ionicons name="play" size={30} color={theme.background} />;
    }

    return <Ionicons name="pause" size={30} color={theme.background} />;
  }, [fasting, withinFasting]);

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
