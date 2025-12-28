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
    "com.googleusercontent.apps.438582901138-7lo7q4ggvn1q03mdmtv51ivphdng6sro",
  version: "1.2.0",
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
    buildNumber: "1.2.0",
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
    revenueCatApiKey: process.env.REVENUECAT_API_KEY,
    adAppId: process.env.AD_APP_ID,
    bannerAdUnitId: process.env.BANNER_AD_UNIT_ID,
    nativeAdUnitId: process.env.NATIVE_AD_UNIT_ID,
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
        enableBackgroundRemoteNotifications: true,
      },
    ],
    "expo-background-task",
    [
      "expo-tracking-transparency",
      {
        userTrackingPermission:
          "This identifier will be used to deliver personalized ads to you.",
      },
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: "ca-app-pub-2448949656898180~1378746689",
        iosAppId: "ca-app-pub-2448949656898180~1378746689",
        userTrackingUsageDescription:
          "This identifier will be used to deliver personalized ads to you.",
        skAdNetworkItems: [
          "cstr6suwn9.skadnetwork",
          "4fzdc2evr5.skadnetwork",
          "2fnua5tdw4.skadnetwork",
          "ydx93a7ass.skadnetwork",
          "p78axxw29g.skadnetwork",
          "v72qych5uu.skadnetwork",
          "ludvb6z3bs.skadnetwork",
          "cp8zw746q7.skadnetwork",
          "3sh42y64q3.skadnetwork",
          "c6k4g5qg8m.skadnetwork",
          "s39g8k73mm.skadnetwork",
          "3qy4746246.skadnetwork",
          "f38h382jlk.skadnetwork",
          "hs6bdukanm.skadnetwork",
          "mlmmfzh3r3.skadnetwork",
          "v4nxqhlyqp.skadnetwork",
          "wzmmz9fp6w.skadnetwork",
          "su67r6k2v3.skadnetwork",
          "yclnxrl5pm.skadnetwork",
          "t38b2kh725.skadnetwork",
          "7ug5zh24hu.skadnetwork",
          "gta9lk7p23.skadnetwork",
          "vutu7akeur.skadnetwork",
          "y5ghdn5j9k.skadnetwork",
          "v9wttpbfk9.skadnetwork",
          "n38lu8286q.skadnetwork",
          "47vhws6wlr.skadnetwork",
          "kbd757ywx3.skadnetwork",
          "9t245vhmpl.skadnetwork",
          "a2p9lx4jpn.skadnetwork",
          "22mmun2rn5.skadnetwork",
          "44jx6755aq.skadnetwork",
          "k674qkevps.skadnetwork",
          "4468km3ulz.skadnetwork",
          "2u9pt9hc89.skadnetwork",
          "8s468mfl3y.skadnetwork",
          "klf5c3l5u5.skadnetwork",
          "ppxm28t8ap.skadnetwork",
          "kbmxgpxpgc.skadnetwork",
          "uw77j35x4d.skadnetwork",
          "578prtvx9j.skadnetwork",
          "4dzt52r2t5.skadnetwork",
          "tl55sbb4fm.skadnetwork",
          "c3frkrj4fj.skadnetwork",
          "e5fvkxwrpn.skadnetwork",
          "8c4e2ghe7u.skadnetwork",
          "3rd42ekr43.skadnetwork",
          "97r2b46745.skadnetwork",
          "3qcr597p9d.skadnetwork",
        ],
      },
    ],
  ],
});
