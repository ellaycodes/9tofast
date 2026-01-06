import { Alert, StyleSheet, View } from "react-native";
import Title from "../../components/ui/Title";
import SubtitleText from "../../components/ui/SubtitleText";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import PrimaryButton from "../../components/ui/PrimaryButton";
import FlatButton from "../../components/ui/FlatButton";
import { useAppTheme } from "../../store/app-theme-context";
import { useMemo } from "react";
import { setOptimisticPremium, usePremium } from "../../hooks/usePremium";
import RevenueCatUI from "react-native-purchases-ui";
import Purchases from "react-native-purchases";

function PremiumPaywallScreen({ navigation }) {
  const { theme } = useAppTheme();
  const memoStyle = useMemo(() => styles(theme), [theme]);
  const { refresh } = usePremium();

  async function handleContinuePremium() {
    // try {
    //   const paywallResult = await RevenueCatUI.presentPaywall();

    //   if (paywallResult === "PURCHASED" || paywallResult === "RESTORED") {
    //     setOptimisticPremium(true);
    //     await refresh();
    //     navigation.navigate("SettingsHomeScreen");
    //   }

    //   console.log("paywall result", paywallResult);
    // } catch (err) {
    //   console.warn(err);
    //   Alert.alert(
    //     "Error with Premium Subscription",
    //     "We're very sorry but we could not subscribe you to Premium. Please try again later or contact support if this persists.",
    //     [
    //       {
    //         text: "Contact Support",
    //         onPress: () => navigation.navigate("SupportScreen"),
    //         style: "default",
    //       },
    //       {
    //         text: "Cancel",
    //         style: "cancel",
    //       },
    //     ]
    //   );
    // }
  }

  async function handleRestorePurchase() {
    const restoreResult = await Purchases.restorePurchases();
    if (restoreResult) {
      setOptimisticPremium(true);
      await refresh();
      navigation.navigate("TimerScreen");
      console.log(restoreResult);
    } else {
      console.log("todo");
    }
  }

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
            £0.99 Per Month
          </SubtitleText>
          <SubtitleText style={memoStyle.SubtitleText}>
            £9.99 Annual
          </SubtitleText>
          <SubtitleText style={memoStyle.SubtitleText}>
            £19.99 Forever
          </SubtitleText>
        </View>

        <View>
          <SettingsPressable icon="not-interested" label="No Ads" />
          <SettingsPressable
            icon="new-releases"
            label="Early Access to New Features"
          />
          <SettingsPressable icon="watch" label="Future Wearable Support" />
        </View>
      </View>

      <View>
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
