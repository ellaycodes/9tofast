import "dotenv/config";

export default ({ config }) => ({
  ...config,
  name: "9ToFast",
  slug: "9tofast",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0F2524",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0F2524",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
  },
  plugins: [
    "expo-font",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0F2524",
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
      },
    ],
    "expo-asset",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
      },
    ],
  ],
  "react-native-google-mobile-ads": {
    ios_app_id: "ca-app-pub-2448949656898180~1378746689",
  },
});
