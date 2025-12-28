import { Platform } from "react-native";
import { useEffect } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import Constants from "expo-constants";

export default function App() {
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
}
