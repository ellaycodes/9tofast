import axios from "axios";
import Constants from "expo-constants";

export async function useAuth(anonymous, mode, email, password) {
  const url = `${Constants.expoConfig.extra.firebaseAuthDomain}${mode}?key=${Constants.expoConfig.extra.firebaseApiKey}`;

  let res;

  if (!anonymous) {
    res = await axios.post(url, {
      email: email,
      password: password,
      returnSecureToken: true,
    });
  } else {
    res = await axios.post(url, {
      returnSecureToken: true
    });
  }

  const token = res?.data.idToken;
  return token;
}

export function createUser(email, password) {
  return useAuth(false, "signUp", email, password);
}

export function login(email, password) {
  return useAuth(false, "signInWithPassword", email, password);
}

export function anonymousUser() {
  return useAuth(true, "signUp");
}
