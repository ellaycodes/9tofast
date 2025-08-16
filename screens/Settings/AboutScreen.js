import { ScrollView, StyleSheet, View, Text } from "react-native";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import Disclaimer from "../../components/Settings/Disclaimer";
import SettingsRow from "../../components/Settings/SettingsRow";
import { useAppTheme } from "../../store/app-theme-context";

function AboutScreen() {
  const { theme } = useAppTheme();
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <View>
          <Title size={24} style={{ paddingBottom: 0 }}>
            About 9ToFast
          </Title>
          <SubtitleText muted style={{ paddingTop: 0, marginTop: 0 }}>
            Simple intermittent fasting that fits your day.
          </SubtitleText>
        </View>

        <View>
          <SubtitleText style={styles.aboutStoryText} size="l">
            9toFast helps you set a window, stay on track, and review your
            progress.
          </SubtitleText>

          <SubtitleText style={styles.aboutStoryText} size="l">
            Made for busy 9 to 5 workers who want a clean fasting timer without
            clutter.
          </SubtitleText>

          <SubtitleText style={styles.aboutStoryText} size="l">
            Created by <Text style={{ fontWeight: "bold" }}>9toLiving Co.</Text>
          </SubtitleText>
        </View>

        <View style={styles.aboutInfoContainer}>
          <SettingsRow label="Version" right="v1.0.0" />

          <SettingsRow
            label="Contact"
            right="support@9tohealthapps.com"
            onPress={() => console.log("TODO")}
          />

          <SettingsRow
            label="Privacy Policy"
            onPress={() => console.log("TODO")}
          />

          <SettingsRow
            label="Terms of Service"
            onPress={() => console.log("TODO")}
          />
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: theme.secondary200,
            marginTop: 8,
          }}
        />

        <View>
          <Disclaimer />
        </View>
      </View>
    </ScrollView>
  );
}

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  aboutStoryText: {
    textAlign: "left",
  },
  aboutInfoContainer: {
    marginTop: 8,
    gap: 4,
  },
});
