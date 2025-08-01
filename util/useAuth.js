import axios from "axios";
import Constants from "expo-constants";

const authDomain = Constants.expoConfig.extra.firebaseAuthDomain;
const apiKey = Constants.expoConfig.extra.firebaseApiKey;

export async function useAuth(anonymous, mode, email, password) {
  const url = `${authDomain}${mode}?key=${apiKey}`;

  let res;

  if (!anonymous) {
    res = await axios.post(url, {
      email: email,
      password: password,
      returnSecureToken: true,
    });
  } else {
    res = await axios.post(url, {
      returnSecureToken: true,
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

export async function forgottenPassword(email) {
  const url = `${authDomain}sendOobCode?key=${apiKey}`;

  const res = await axios.post(url, {
    requestType: "PASSWORD_RESET",
    email: email,
  });
  return res;
}

export async function getAccountInfo(idToken) {
  const url = `${authDomain}lookup?key=${apiKey}`;
  const res = await axios.post(url, {
    idToken: idToken,
  });

  return res;
}
