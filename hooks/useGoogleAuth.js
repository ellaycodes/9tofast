import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";

export default function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: Constants.expoConfig.extra.iosClientId,
    expoClientId: Constants.expoConfig.extra.expoClientId,
    redirectUri: makeRedirectUri({
      useProxy: Constants.executionEnvironment === "expo",
    }),
  });

  return { request, response, promptAsync };
}
