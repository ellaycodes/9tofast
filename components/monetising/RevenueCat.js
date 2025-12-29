import { Platform } from "react-native";
import { useEffect } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import Constants from "expo-constants";

let configured = false;

export default async function configureRevenueCat() {
  if (configured) return;

  Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

  const iosApiKey = Constants.expoConfig.extra.revenueCatApiKey;
  const androidApiKey = Constants.expoConfig?.extra?.revenueCatAndroidApiKey;

  const apiKey = Platform.OS === "ios" ? iosApiKey : androidApiKey;

  if (!apiKey) {
    console.warn("RevenueCat API key missing");
    return;
  }

  Purchases.configure(apiKey);
  configured = true;
}
