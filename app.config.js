import "dotenv/config";
import { runtimeVersion } from "expo-updates";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.horizon.x9tofast.dev";
  }

  if (IS_PREVIEW) {
    return "com.horizon.x9tofast.preview";
  }

  return "com.horizon.x9tofast";
};

const getAppName = () => {
  if (IS_DEV) {
    return "9ToFast (Dev)";
  }

  if (IS_PREVIEW) {
    return "9ToFast (Preview)";
  }

  return "9ToFast";
};

export default ({ config }) => ({
  ...config,
  name: getAppName(),
  slug: "9tofast",
  owner: "horizon9tofast",
  scheme:
    "com.googleusercontent.apps.128918843006-hrpgvhahugjeq9868t1ln3n7euo4l9ar",
  version: "1.1.0",
  orientation: "portrait",
  icon: "./assets/icon2.png",
  backgroundColor: "#0F2524",
  splash: {
    image: "./assets/splash-icon2.png",
    resizeMode: "cover",
    backgroundColor: "#0F2524",
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/edb449e1-65ff-4007-b24b-4404f8c7595c",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    buildNumber: "1.1.0",
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    usesAppleSignIn: true,
    googleServicesFile: IS_PREVIEW
      ? "./plists/GoogleService-Info-Staging.plist"
      : "./plists/GoogleService-Info.plist",
    config: {
      googleMobileAdsAppId: "ca-app-pub-2448949656898180~1378746689",
    },
    infoPlist: {
      GADApplicationIdentifier: "ca-app-pub-2448949656898180~1378746689",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0F2524",
    },
    package: "com.horizon.x9tofast",
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
    iosClientId: process.env.IOS_CLIENT_ID,
    expoClientId: process.env.EXPO_CLIENT_ID,
    eas: {
      projectId: "edb449e1-65ff-4007-b24b-4404f8c7595c",
    },
  },
  plugins: [
    "expo-font",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0F2524",
        image: "./assets/splash-icon2.png",
        resizeMode: "cover",
        imageWidth: 200,
        dark: {
          backgroundColor: "#0F2524",
        },
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
    "expo-web-browser",
    "expo-apple-authentication",
    [
      "expo-notifications",
      {
        icon: "./local/assets/adaptive-icon2.png",
        color: "#ffffff",
        defaultChannel: "default",
        enableBackgroundRemoteNotifications: false,
      },
    ],
  ],
});
