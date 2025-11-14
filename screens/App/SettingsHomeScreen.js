import { useContext, useEffect } from "react";
import { ScrollView, View } from "react-native";
import * as dt from "date-fns";
import { AuthContext } from "../../store/auth-context";
import { useAppTheme } from "../../store/app-theme-context";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import SectionTitle from "../../components/Settings/SectionTitle";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import { auth } from "../../firebase/app";

function SettingsHomeScreen({ navigation }) {
  const authCxt = useContext(AuthContext);
  const { schedule } = useFasting();
  const { themeName } = useAppTheme();

  function editScheduleHandler() {
    navigation.navigate("EditScheduleScreen");
  }

  function manageAccountHandler() {
    navigation.navigate("ManageAccountScreen");
  }

  function editThemeHandler() {
    navigation.navigate("EditThemeScreen");
  }

  function profileHandler() {
    navigation.navigate("ProfileScreen", {
      emailAddress: authCxt.emailAddress,
      username: authCxt.username,
    });
  }

  function premiumHandler() {
    navigation.navigate("PremiumPaywallScreen");
  }

  function aboutScreenHandler() {
    navigation.navigate("AboutScreen");
  }

  function supportScreenHandler() {
    navigation.navigate("SupportScreen");
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <View>
        <SettingsPressable
          profile
          icon="person-outline"
          label={authCxt.emailAddress ? authCxt.username : "Create Account"}
          subtitle={
            authCxt.emailAddress != undefined
              ? authCxt.emailAddress
              : authCxt.username
          }
          onPress={profileHandler}
          style={{paddingBottom: 20}}
        />
        <SectionTitle>Account</SectionTitle>
        {authCxt.emailAddress ? null : (
          <SettingsPressable
            icon="mode-edit-outline"
            label="Manage Account"
            onPress={manageAccountHandler}
          />
        )}
      </View>
      <View>
        <SectionTitle>Preferences</SectionTitle>
        <SettingsPressable
          label="Theme"
          icon="design-services"
          onPress={editThemeHandler}
          subtitle={themeName}
        />
        <SettingsPressable
          onPress={editScheduleHandler}
          label="Edit Fasting Schedule"
          icon="access-time"
          subtitle={
            schedule
              ? `${dt.format(
                  dt.parse(schedule.start, "HH:mm", new Date()),
                  "p"
                )} - ${dt.format(
                  dt.parse(schedule.end, "HH:mm", new Date()),
                  "p"
                )}`
              : undefined
          }
        />
      </View>
      {/* <View>
        <SectionTitle>Premium</SectionTitle>
        <SettingsPressable
          label="Upgrade to Premium"
          icon="star-border"
          onPress={premiumHandler}
        />
      </View> */}
      <View>
        <SectionTitle>About & Support</SectionTitle>
        <SettingsPressable
          label="About"
          icon="info-outline"
          onPress={aboutScreenHandler}
        />
        <SettingsPressable
          label="Support"
          icon="help-outline"
          onPress={supportScreenHandler}
        />
      </View>
    </ScrollView>
  );
}

export default SettingsHomeScreen;
