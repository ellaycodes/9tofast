import { StyleSheet, View, Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import PrimaryButton from "../../components/ui/PrimaryButton";
import FlatButton from "../../components/ui/FlatButton";
import { useAppTheme } from "../../store/app-theme-context";
import { useMemo, useEffect } from "react";
import Constants from "expo-constants";

function PremiumPaywallScreen() {
  const { theme } = useAppTheme();
  const memoStyle = useMemo(() => styles(theme), [theme]);

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    // Platform-specific API keys
    const iosApiKey = Constants.expoConfig.extra.revenueCatApiKey;

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: iosApiKey });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: androidApiKey });
    }
  }, []);

  function handleContinuePremium() {
    console.log(Purchases.LOG_LEVEL)
  }

  function handleRestorePurchase() {}
  
  return (
    <View style={memoStyle.container}>
      <View>
        <Title
          style={{
            alignItems: "flex-start",
            paddingLeft: 0,
          }}
          size={28}
        >
          Go Premium, Stay Focused
        </Title>

        <View style={memoStyle.pricesContainer}>
          <SubtitleText style={memoStyle.SubtitleText}>
            £0.49 Per Month
          </SubtitleText>
          <SubtitleText style={memoStyle.SubtitleText}>
            £4.99 Annual
          </SubtitleText>
          <SubtitleText style={memoStyle.SubtitleText}>
            £9.99 Forever
          </SubtitleText>
        </View>

        <View>
          <SettingsPressable icon="not-interested" label="No Ads" />
          {/* <SettingsPressable icon="calendar-month" label="Calendar Sync" /> */}
          <SettingsPressable icon="watch" label="Future Wearable Support" />
        </View>
      </View>

      <View>
        {/* <SubtitleText>Coming Soon</SubtitleText> */}
        <PrimaryButton onPress={handleContinuePremium} lowlight>
          Continue
        </PrimaryButton>
        <FlatButton onPress={handleRestorePurchase} inline>
          Restore Purchase
        </FlatButton>
      </View>
    </View>
  );
}

export default PremiumPaywallScreen;

const styles = (theme) =>
  StyleSheet.create({
    pricesContainer: {
      justifyContent: "flex-start",
      marginBottom: 12,
    },
    SubtitleText: {
      padding: 0,
      alignItems: "flex-start",
    },
    container: {
      margin: 18,
      flex: 1,
      justifyContent: "space-between",
    },
  });
