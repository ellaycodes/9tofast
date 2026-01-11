import { useContext } from "react";
import { ScrollView, View } from "react-native";
import * as dt from "date-fns";
import { AuthContext } from "../../store/auth-context";
import { useAppTheme } from "../../store/app-theme-context";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import SectionTitle from "../../components/Settings/SectionTitle";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import Ads from "../../components/monetising/Ads";
import { premiumHandler } from "../../components/monetising/RevenueCat";
import { usePremium } from "../../store/premium-context";
import { auth } from "../../firebase/app";

function SettingsHomeScreen({ navigation }) {
  const authCxt = useContext(AuthContext);
  const { schedule } = useFasting();
  const { themeName } = useAppTheme();
  const { loading, isPremium, refresh, isConfigured } = usePremium();

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

  function aboutScreenHandler() {
    navigation.navigate("AboutScreen");
  }

  function supportScreenHandler() {
    navigation.navigate("SupportScreen");
  }

  function statsScreenHandler() {
    navigation.navigate("StatsScreen");
  }

  return (
    <ScrollView style={{ margin: 10 }}>
      <View>
        <SectionTitle>Account</SectionTitle>
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
        />
        {authCxt.emailAddress ? null : (
          <SettingsPressable
            icon="mode-edit-outline"
            label="Manage Account"
            onPress={manageAccountHandler}
          />
        )}
      </View>
      <View>
        <SettingsPressable
          label="Stats"
          icon="query-stats"
          onPress={statsScreenHandler}
        />
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
      {loading || isPremium ? null : (
        <>
          <Ads disabled={isPremium} />
          <View>
            <SectionTitle>Premium</SectionTitle>
            <SettingsPressable
              label="Upgrade to Premium"
              icon="star-border"
              onPress={() =>
                premiumHandler({ navigation, refresh, isConfigured })
              }
            />
          </View>
        </>
      )}
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
