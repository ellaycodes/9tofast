import axios from "axios";
import Constants from "expo-constants";

export async function useAuth(mode, email, password) {
  const url = `${Constants.expoConfig.extra.firebaseAuthDomain}${mode}?key=${Constants.expoConfig.extra.firebaseApiKey}`;
  
  const res = await axios.post(url, {
    email: email,
    password: password,
    returnSecureToken: true,
  });

  const token = res.data.idToken;
  return token;
}

export function createUser(email, password) {
  return useAuth("signUp", email, password);
}

export function login(email, password) {
  return useAuth("signInWithPassword", email, password);
}
