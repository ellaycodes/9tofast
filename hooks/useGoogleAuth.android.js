import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase/app";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";

export default function useGoogleAuthAndroid() {
  async function signIn() {
    GoogleSignin.configure({
      webClientId: Constants.expoConfig.extra.expoClientId,
    });
    await GoogleSignin.hasPlayServices();
    const { data } = await GoogleSignin.signIn();

    const googleCredential = GoogleAuthProvider.credential(data.idToken);
    const { user } = await signInWithCredential(auth, googleCredential);

    return user;
  }

  return { signIn };
}
