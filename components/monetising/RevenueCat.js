import { Alert, Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import Constants from "expo-constants";
import RevenueCatUI from "react-native-purchases-ui";
import { setOptimisticPremium } from "../../hooks/usePremium";

export default async function configureRevenueCat() {
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

  const iosApiKey = Constants.expoConfig.extra.revenueCatApiKey;
  const androidApiKey = Constants.expoConfig?.extra?.revenueCatAndroidApiKey;

  const apiKey = Platform.OS === "ios" ? iosApiKey : androidApiKey;

  if (!apiKey) {
    console.warn("RevenueCat API key missing");
    return;
  }

  return Purchases.configure({ apiKey });
}

export async function premiumHandler() {
  try {
    const paywallResult = await RevenueCatUI.presentPaywall();

    if (paywallResult === "PURCHASED" || paywallResult === "RESTORED") {
      setOptimisticPremium(true);
      await refresh();
      navigation.navigate("SettingsHomeScreen");
    }

    console.log("paywall result", paywallResult);
  } catch (err) {
    console.warn(err);
    Alert.alert(
      "Error with Premium Subscription",
      "We're very sorry but we could not subscribe you to Premium. Please try again later or contact support if this persists.",
      [
        {
          text: "Contact Support",
          onPress: () => navigation.navigate("SupportScreen"),
          style: "default",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  }
}
