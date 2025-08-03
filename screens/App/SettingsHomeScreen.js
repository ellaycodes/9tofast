import { useContext, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import * as dt from "date-fns";
import { AuthContext } from "../../store/auth-context";
import { useAppTheme } from "../../store/app-theme-context";
import { useFasting } from "../../store/fastingLogic/fasting-context";
import SectionTitle from "../../components/Settings/SectionTitle";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import { getAccountInfo } from "../../util/useAuth";

function SettingsHomeScreen({ navigation }) {
  const authCxt = useContext(AuthContext);
  const { schedule } = useFasting();
  const [emailAddress, setEmailAddress] = useState();
  const { themeName } = useAppTheme();

  useEffect(() => {
    (async () => {
      const res = await getAccountInfo(authCxt.token);
      setEmailAddress(res.data.users[0].email);
    })();
  }, []);

  function editScheduleHandler() {
    navigation.navigate("EditScheduleScreen");
  }

  function manageAccountHandler() {
    navigation.navigate("ManageAccountScreen");
  }

  function editThemeHandler() {
    navigation.navigate("EditThemeScreen");
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <View>
        <SectionTitle>Account</SectionTitle>
        <SettingsPressable
          profile
          icon="person-outline"
          label="Create Account"
          subtitle={emailAddress}
        />
        <SettingsPressable
          icon="mode-edit-outline"
          label="Manage Account"
          onPress={manageAccountHandler}
        />
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
          subtitle={`${dt.format(
            dt.parse(schedule?.start, "HH:mm", new Date()),
            "p"
          )} - ${dt.format(dt.parse(schedule?.end, "HH:mm", new Date()), "p")}`}
        />
      </View>
      <View>
        <SectionTitle>Premium</SectionTitle>
        <SettingsPressable label="Upgrade to Premium" icon="star-border" />
      </View>
      <View>
        <SectionTitle>About & Support</SectionTitle>
        <SettingsPressable label="About" icon="info-outline" />
        <SettingsPressable label="Support" icon="help-outline" />
      </View>
    </ScrollView>
  );
}

export default SettingsHomeScreen;
