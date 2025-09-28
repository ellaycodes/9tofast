import { ScrollView, StyleSheet, View, Linking } from "react-native";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import SettingsRow from "../../components/Settings/SettingsRow";
import FAQDropdown from "../../components/Settings/FAQDropdown";
import FlatButton from "../../components/ui/FlatButton";
import { useContext } from "react";
import { AuthContext } from "../../store/auth-context";

function SupportScreen() {
  const authCtx = useContext(AuthContext);

  const subject = encodeURIComponent(`Support Request [Ref: ${authCtx.uid}]`);
  const body = encodeURIComponent(
    `Hello Support Team,
    
    I have a question. 

    [Insert Question Here]

    Thank You,
    ${authCtx.fullName || authCtx.username || "User"}`
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <View style={styles.sectionContainer}>
          <Title size={26} style={styles.title}>
            Contact Us
          </Title>
          <View style={styles.sectionContainer}>
            <SubtitleText style={[styles.subtitleText, { fontWeight: "bold" }]}>
              Need Help?
            </SubtitleText>
            <SubtitleText style={styles.subtitleText} size="l">
              Reach out to our support team at{" "}
              <FlatButton
                onPress={() =>
                  Linking.openURL(
                    `mailto:9tofast@gmail.com?subject=${subject}&body=${body}`
                  )
                }
              >
                9tofast@gmail.com
              </FlatButton>
              . We're here to help!
            </SubtitleText>
            <SubtitleText style={styles.subtitleText} size="l">
              We aim to reply to all inquiries within 2 business days. Your
              patience is appreciated.
            </SubtitleText>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Title size={26} style={styles.title}>
            Frequently Asked Questions
          </Title>
          <FAQDropdown answer="Your fasting schedule should start/end according to your chosen schedule but should you want to change this temporarily you can choose to pause the fast by selecting 'Pause Fast'/'Start Fast Early' on the home screen or you can choose to edit your schedule entirely.">
            How do I start or end a fast?
          </FAQDropdown>
          <FAQDropdown answer="Navigate to the settings tab and select 'Edit Fasting Schedule'. Here you can either select a premade preset or you can customise your own. Just select the start and end time and click">
            How do I edit my Fasting Schedule?
          </FAQDropdown>
          <FAQDropdown answer="Currently you cannot edit any historical fasts but we are working on this. Stay Tuned!">
            How do edit a Fast?
          </FAQDropdown>
          <FAQDropdown answer="You can change your password from your profile page by selecting 'Change Password">
            How do I reset my password?
          </FAQDropdown>
        </View>

        <View style={styles.sectionContainer}>
          <Title size={26} style={styles.title}>
            Legal
          </Title>
          <SettingsRow
            label="Privacy Policy"
            onPress={() => console.log("TODO")}
          />
          <SettingsRow
            label="Terms of Service"
            onPress={() => console.log("TODO")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

export default SupportScreen;

const styles = StyleSheet.create({
  sectionContainer: {
    alignItems: "left",
  },
  container: {
    justifyContent: "space-between",
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    textAlign: "left",
    alignItems: "left",
    paddingLeft: 0,
    marginBottom: 0,
    paddingBottom: 4,
  },
  subtitleText: {
    textAlign: "left",
    alignItems: "left",
    padding: 0,
    marginVertical: 0,
  },
});
