import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";
import {
  getTrackingPermissionsAsync,
  PermissionStatus,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";

export default async function MobileAdsConfig() {
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.MA,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  });

  const { status } = await getTrackingPermissionsAsync();
  if (status === PermissionStatus.UNDETERMINED) {
    await requestTrackingPermissionsAsync();
  }

  const adapterStatuses = await mobileAds().initialize();
  console.log(adapterStatuses);

  return adapterStatuses;
}
