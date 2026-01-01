import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";

export default function useGoogleAuthIOS() {
  const redirectUri = makeRedirectUri({
    scheme: "com.horizon.x9tofast",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: Constants.expoConfig.extra.iosClientId,
    expoClientId: Constants.expoConfig.extra.expoClientId,
    redirectUri,
  });

 function signIn() {
    return promptAsync();
  }

  return { request, response, signIn };
}
