import { Platform, StyleSheet, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from "react-native-google-mobile-ads";
import { useRef } from "react";

function Ads() {
  const bannerRef = useRef(null);

  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load();
  });

  return (
    <View style={styles.conatiner}>
      <BannerAd
        ref={bannerRef}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        unitId={TestIds.BANNER}
        // unitId={Constants.expoConfig.extra.bannerAdUnitId}
        onAdFailedToLoad={(error) => {
          console.log("Banner failed to load:", error);
        }}
      />
    </View>
  );
}

export default Ads;

const styles = StyleSheet.create({
  conatiner: {
    paddingVertical: 15,
  },
});
