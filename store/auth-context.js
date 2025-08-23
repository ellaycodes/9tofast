import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { anonymousUser } from "../util/useAuth";

export const AuthContext = createContext({
  token: "",
  username: "",
  refreshToken: "",
  emailAddress: "",
  isAuthed: false,
  anonymousUser: (emailAddress) => {},
  authenticate: (token, refreshToken, userName) => {},
  logout: () => {},
  setTokens: (idToken, refreshToken) => {},
  updateUsername: (username) => {},
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

  function updateUsername(username) {
    setUsername(username);
    AsyncStorage.setItem("username", username);
  }

  const value = {
    token: authToken,
    username: username,
    refreshToken: refreshToken,
    emailAddress: emailAddress,
    isAuthed: !!authToken,
    anonymousUser: anonymousUser,
    authenticate: authenticate,
    logout: logout,
    setTokens: setTokens,
    updateUsername: updateUsername,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
