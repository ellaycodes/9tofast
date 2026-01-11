import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Constants from "expo-constants";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";

const PremiumContext = createContext({
  isConfigured: false,
  loading: false,
  isPremium: null,
  customerInfo: (info) => {},
  error: false,
  refresh: () => {},
  premiumLogIn: async (uid) => {},
  premiumLogOut: async () => {},
});

function getApiKey() {
  const iosApiKey = Constants.expoConfig.extra.revenueCatApiKey;
  const androidApiKey = Constants.expoConfig?.extra?.revenueCatAndroidApiKey;
  return Platform.OS === "ios" ? iosApiKey : androidApiKey;
}

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const configuredRef = useRef(false);
  const configuringRef = useRef(false);

  const entitlementId = "9tofast Premium";

  const configure = useCallback(async () => {
    if (configuredRef.current || configuringRef.current) return;
    configuringRef.current = true;

    try {
      Purchases.setLogLevel(LOG_LEVEL.ERROR);

      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error("REVENUECAT_MISSING_API_KEY");
      }

      await Promise.resolve(Purchases.configure({ apiKey }));

      configuredRef.current = true;
      setIsConfigured(true);
    } catch (err) {
      configuredRef.current = false;
      console.error("PREMIUM CONFIGURING ERROR =>>>", err);
      setError(err);
    } finally {
      configuringRef.current = false;
    }
  }, []);

  const syncCustomerInfo = useCallback(
    async (info) => {
      if (!info) {
        info = await Purchases.getCustomerInfo();
      }

      const active = !!info?.entitlements?.active?.[entitlementId]?.isActive;
      setIsPremium(active);
      setCustomerInfo(info ?? null);
      setLoading(false);
    },
    [entitlementId]
  );

  useEffect(() => {
    setLoading(true);
    let unsubscribe;

    (async () => {
      try {
        await configure();

        unsubscribe = Purchases.addCustomerInfoUpdateListener((info) => {
          syncCustomerInfo(info);
        });
        await syncCustomerInfo();
      } catch (e) {
        setLoading(false);
      }
    })();

    return () => {
      try {
        if (typeof unsubscribe === "function") unsubscribe();
        else if (unsubscribe?.remove) unsubscribe.remove();
      } catch {}
    };
  }, [configure, syncCustomerInfo]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      await configure();
      await syncCustomerInfo();
    } catch (e) {
      setError(e);
      setLoading(false);
      console.error("PREMIUM REFRESH ERROR =>>>", e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [configure, syncCustomerInfo]);

  const premiumLogIn = useCallback(
    async (appUserId) => {
      try {
        if (!appUserId) return;

        await configure();

        const { customerInfo: info } = await Purchases.logIn(appUserId);
        await syncCustomerInfo(info);
      } catch (e) {
        setError(e);
        console.error("PREMIUM LOG IN ERROR =>>>", e);
        // throw e;
      }
    },
    [configure, syncCustomerInfo]
  );

  const premiumLogOut = useCallback(async () => {
    try {
      await configure();
      setLoading(true);
      const info = await Purchases.getCustomerInfo();
      const isAnonymous =
        info?.originalAppUserId?.startsWith("$RCAnonymousID:");

      if (!isAnonymous) {
        const { customerInfo: loggedOutInfo } = await Purchases.logOut();
        await syncCustomerInfo(loggedOutInfo);
      } else {
        await syncCustomerInfo(info);
      }
    } catch (err) {
      setError(err);
      console.error("PREMIUM LOG OUT ERROR =>>>", err);
    }
  }, [configure, refresh]);

  const value = useMemo(
    () => ({
      isConfigured,
      loading,
      isPremium,
      customerInfo,
      error,
      refresh,
      premiumLogIn,
      premiumLogOut,
    }),
    [
      isConfigured,
      loading,
      isPremium,
      customerInfo,
      error,
      refresh,
      premiumLogIn,
      premiumLogOut,
    ]
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
}
