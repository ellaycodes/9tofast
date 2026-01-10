import { useEffect, useState, useCallback } from "react";
import Purchases from "react-native-purchases";

let optimisticPremium = false;

export const setOptimisticPremium = (value = true) => {
  optimisticPremium = value;
};

// export function usePremium() {
//   const [isPremium, setIsPremium] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const check = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const customerInfo = await Purchases.getCustomerInfo();
//       const hasEntitlement =
//         !!customerInfo.entitlements.active?.["9tofast Premium"]?.isActive;

//       setIsPremium(hasEntitlement || optimisticPremium);
//       if (hasEntitlement) optimisticPremium = false;
//     } catch (e) {
//       setError(e);
//       setIsPremium(false);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     check();
//   }, [check]);

//   useEffect(() => {
//     const unsubscribe = Purchases.addCustomerInfoUpdateListener(
//       (customerInfo) => {
//         const hasEntitlement =
//           !!customerInfo.entitlements.active?.["9tofast Premium"]?.isActive;

//         setIsPremium(hasEntitlement || optimisticPremium);
//         setLoading(false);
//       }
//     );

//     return () => unsubscribe?.();
//   }, []);

//   return { isPremium, loading, error, refresh: check };
// }
