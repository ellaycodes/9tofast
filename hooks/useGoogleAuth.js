import { Platform } from "react-native";
import useGoogleAuthAndroid from "./useGoogleAuth.android";
import useGoogleAuthIOS from "./useGoogleAuth.ios";

export default function useGoogleAuth() {
  
  return Platform.OS === "android"
    ? useGoogleAuthAndroid()
    : useGoogleAuthIOS();
}
