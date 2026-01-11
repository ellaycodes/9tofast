import { Alert } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";

export async function premiumHandler({ navigation, refresh, isConfigured }) {
  if (!isConfigured) await refresh();
  
  try {
    const paywallResult = await RevenueCatUI.presentPaywall();

    if (paywallResult === "PURCHASED" || paywallResult === "RESTORED") {
      await refresh();
      navigation.navigate("Settings", {
        screen: "SettingsHomeScreen",
      });
    }

    console.log("paywall result", paywallResult);
    return paywallResult;
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
