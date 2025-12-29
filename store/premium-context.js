import { createContext, useContext } from "react";
import { usePremium } from "../hooks/usePremium";

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const premiumState = usePremium();
  return <PremiumContext.Provider value={premiumState}>{children}</PremiumContext.Provider>;
}

export function usePremiumState() {
  return useContext(PremiumContext);
}
