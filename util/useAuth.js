import axios from "axios";
import Constants from "expo-constants";

const authDomain = Constants.expoConfig.extra.firebaseAuthDomain;
const apiKey = Constants.expoConfig.extra.firebaseApiKey;
/**
 *
 * @param {boolean} anonymous
 * @param {"signUp" | "signInWithPassword"} mode
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
export async function useAuth(anonymous, mode, email, password) {
  try {
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
  } catch (err) {
    const msg =
      err?.response?.data?.error?.message || "Could not create account";
    throw new Error(`[AUTH-USEAUTH-001] ${msg}`);
  }
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

/**
 *
 * @param {string} email
 * @returns {AxiosResponse<any>}
 */
export async function forgottenPassword(email) {
  try {
    const url = `${authDomain}sendOobCode?key=${apiKey}`;

    const res = await axios.post(url, {
      requestType: "PASSWORD_RESET",
      email: email,
    });
    return res;
  } catch (err) {
    const msg = err?.response?.data?.error?.message || "Password reset failed";
    throw new Error(`[AUTH-FORGOTPASSWORD-001] ${msg}`);
  }
}

export async function getAccountInfo(idToken) {
  try {
    const url = `${authDomain}lookup?key=${apiKey}`;
    const res = await axios.post(url, {
      idToken: idToken,
    });

    return res;
  } catch (err) {
    const msg =
      err?.response?.data?.error?.message || "Error: please contact support";
    throw new Error(`[AUTH-GETACCOUNTINFO-001] ${msg}`);
  }
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
    const msg = err?.response?.data?.error?.message || "Update Failed";
    throw new Error(`[AUTH-UPDATEPROFILE-001] ${msg}`);
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
    const msg = err?.response?.data?.error?.message || "Unable to link account";
    throw new Error(`[AUTH-LINKANONYMOUS-001] ${msg}`);
  }
}

export async function refreshIdToken(refreshToken) {
  try {
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

    const res = await axios.post(url, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    return {
      idToken: res.data.id_token,
      refreshToken: res.data.refresh_token || refreshToken,
    };
  } catch (err) {
    throw new Error(`[AUTH-REFRESHTOKEN-001] Could not refresh token`);
  }
}

function getFirebaseErrorMessage(err) {
  return (
    err?.response?.data?.error?.message || err?.message || "Request failed"
  );
}

export async function verifyEmail(idToken) {
  try {
    const url = `${authDomain}sendOobCode?key=${apiKey}`;

    const res = await axios.post(url, {
      requestType: "VERIFY_EMAIL",
      idToken: idToken,
    });

    return res;
  } catch (err) {
    const msg = err?.response?.data?.error?.message || "Could not verify email";
    throw new Error(`[AUTH-VERIFYEMAIL-001] ${msg}`);
  }
}

export async function deleteUser(idToken) {
  try {
    const url = `${authDomain}delete?key=${apiKey}`;
    await axios.post(url, {
      idToken: idToken,
    });
  } catch (err) {
    const msg = err?.response?.data?.error?.message || "Could not delete user";
    throw new Error(`[AUTH-DELETEUSER-001] ${msg}`);
  }
}

export async function changePassword(idToken, password) {
  try {
    const url = `${authDomain}update?key=${apiKey}`;

    const res = await axios.post(url, {
      idToken: idToken,
      password: password,
      returnSecureToken: true,
    });
    console.log(password);

    return res;
  } catch (err) {
    const msg = err?.response?.data?.error?.message || "Password change failed";
    throw new Error(`[AUTH-CHANGEPASSWORD-001] ${msg}`);
  }
}

/**
 * Calls an authenticated action and refreshes the token if needed.
 *
 * @param {(idToken: string) => Promise<any>} authAction e.g. idToken => changePassword(idToken, password)
 * @param {() => { idToken: string, refreshToken: string }} getTokens e.g. () => ({ idToken: authCxt.token, refreshToken: authCxt.refreshToken })
 * @param {(tokens: { idToken: string, refreshToken: string }) => Promise<void>|void} setTokens e.g. async ({ idToken, refreshToken }) => {
 * authCxt.setTokens(idToken, refreshToken)
 * await SecureStore.setItemAsync("authTokens", JSON.stringify({ idToken, refreshToken }))
 * }
 * @returns {Promise<any>} The result of the authenticated action.
 */
export async function callAuthWithRefresh(authAction, getTokens, setTokens) {
  try {
    const { idToken } = getTokens();
    console.log("hi");
    return await authAction(idToken);
  } catch (err) {
    const msg = err?.response?.data?.error?.message;
    const msgOptions = [
      "INVALID_ID_TOKEN",
      "TOKEN_EXPIRED",
      "CREDENTIAL_TOO_OLD_LOGIN_AGAIN",
    ];
    const shouldRefresh = msgOptions.includes(msg);
    if (!shouldRefresh)
      throw new Error(
        `[AUTH-CALLWITHREFRESH-001] ${getFirebaseErrorMessage(err)}`
      );

    const { refreshToken } = getTokens();

    if (!refreshToken)
      throw new Error(`[AUTH-CALLWITHREFRESH-002] No refresh token available`);

    try {
      const fresh = await refreshIdToken(refreshToken);
      await setTokens(fresh);
      return await authAction(fresh.idToken);
    } catch (err2) {
      throw new Error(
        `[AUTH-CALLWITHREFRESH-003] ${getFirebaseErrorMessage(err2)}`
      );
    }
  }
}
