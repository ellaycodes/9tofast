import { Platform, StyleSheet, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from "react-native-google-mobile-ads";
import { useEffect, useRef, useState } from "react";
import FlatButton from "../ui/FlatButton";
import { useNavigation } from "@react-navigation/native";
import { premiumHandler } from "./RevenueCat";
import { usePremium } from "../../store/premium-context";

function Ads({ disabled = false }) {
  const bannerRef = useRef(null);
  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load();
  });
  const navigation = useNavigation();
  const [canShow, setCanShow] = useState(true);
  const { refresh, isConfigured } = usePremium();

  useEffect(() => {
    setCanShow(true);
  }, []);

  if (disabled || !canShow) return null;

  return (
    <View style={styles.conatiner}>
      <BannerAd
        ref={bannerRef}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        unitId={TestIds.BANNER}
        //unitId={Constants.expoConfig.extra.bannerAdUnitId}
        onAdLoaded={() => {
          setCanShow(true);
        }}
        onAdFailedToLoad={(error) => {
          console.warn("Ad failed to load:", error);
          setCanShow(false);
        }}
      />
      <FlatButton
        size="xs"
        style={{ paddingTop: 0, paddingBottom: 24 }}
        onPress={() => premiumHandler({ navigation, refresh, isConfigured })}
      >
        Want to get rid of ads? Subscribe to Premium
      </FlatButton>
    </View>
  );
}

export default Ads;

const styles = StyleSheet.create({
  conatiner: {
    paddingTop: 15,
    gap: 10,
  },
});
