import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import Constants from "expo-constants";


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
