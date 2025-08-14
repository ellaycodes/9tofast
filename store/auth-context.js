import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { anonymousUser } from "../util/useAuth";

export const AuthContext = createContext({
  token: "",
  username: "",
  refreshToken: "",
  emailAddress: "",
  anonymousUser: (emailAddress) => {},
  isAuthed: false,
  authenticate: (token, refreshToken, userName) => {},
  logout: () => {},
  setTokens: (idToken, refreshToken) => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const [username, setUsername] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [emailAddress, setEmailAddress] = useState();

  function anonymousUser(emailAddress) {
    setEmailAddress(emailAddress);
    AsyncStorage.setItem("emailAddress", emailAddress);
    return true;
  }

  function authenticate(token, refreshToken, userName) {
    setAuthToken(token);
    setUsername(userName);
    setRefreshToken(refreshToken);
    AsyncStorage.setItem("token", token);
    AsyncStorage.setItem("username", userName);
    AsyncStorage.setItem("refreshToken", refreshToken);
  }

  function logout() {
    setAuthToken(null);
    setUsername(null);
    setRefreshToken(null);
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("username");
    AsyncStorage.removeItem("refreshToken");
    AsyncStorage.removeItem("emailAddress");
  }

  function setTokens(idToken, refreshToken) {
    setAuthToken(idToken);
    setRefreshToken(refreshToken);
    AsyncStorage.setItem("token", idToken);
    AsyncStorage.setItem("refreshToken", refreshToken);
  }

  const value = {
    token: authToken,
    username: username,
    refreshToken: refreshToken,
    emailAddress: emailAddress,
    anonymousUser: anonymousUser,
    isAuthed: !!authToken,
    authenticate: authenticate,
    logout: logout,
    setTokens: setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
