import { StyleSheet, View } from "react-native";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import { Colors } from "../../constants/Colors";
import { useAppTheme } from "../../store/app-theme-context";

function EditThemeScreen() {
  const themes = Object.keys(Colors);
  const { setThemeName } = useAppTheme();

  function selectThemeHandler(theme) {
    setThemeName(theme);
  }

  return (
    <View style={styles.container}>
      {themes.map((t) => ( t !== 'Desk' &&
        <SettingsPressable
          key={t}
          label={t}
          icon="123"
          style={{ justifyContent: "space-between" }}
          backgroundColor={{ backgroundColor: Colors[t].secondary100 }}
          onPress={() => selectThemeHandler(t)}
          iconColour={Colors[t].primary100}
          profile
        />
      ))}
    </View>
  );
}

export default EditThemeScreen;

const styles = StyleSheet.create({
  container: {
    margin: 24,
  },
});
