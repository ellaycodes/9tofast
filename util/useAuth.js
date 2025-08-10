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
  const refreshToken = res?.data.refreshToken;
  return { token, refreshToken };
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

export async function updateProfile(idToken, displayName, photoUrl) {
  try {
    const url = `${authDomain}update?key=${apiKey}`;
    const res = await axios.post(url, {
      idToken: idToken,
      displayName: displayName,
      photoUrl: photoUrl,
    });

    return res;
  } catch (err) {
    console.error("Update Profile Err", err.response.data);
  }
}

export async function linkAnonymous(idToken, email, password) {
  try {
    const url = `${authDomain}update?key=${apiKey}`;

    const res = await axios.post(url, {
      idToken: idToken,
      email: email,
      password: password,
      returnSecureToken: true,
    });
    console.log("linkanonymous", res);

    return res;
  } catch (err) {
    console.error(err.response.data.error);
  }
}

export async function refreshIdToken(refreshToken) {
  const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

  const res = await axios.post(url, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  return res;
}

export async function verifyEmail(idToken) {
  const url = `${authDomain}sendOobCode?key=${apiKey}`;

  const res = await axios.post(url, {
    requestType: "VERIFY_EMAIL",
    idToken: idToken,
  });

  return res;
}

export async function deleteAnon(idToken) {
  try {
    const url = `${authDomain}delete?key=${apiKey}`;
    await axios.post(url, {
      idToken: idToken,
    });
  } catch (err) {
    console.warn("deleteAnon failed", err.response?.data || err.message);
  }
}
