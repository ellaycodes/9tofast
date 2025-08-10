import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  token: "",
  username: "",
  refreshToken: "",
  isAuthed: false,
  authenticate: (token, refreshToken, userName) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const [username, setUsername] = useState();
  const [refreshToken, setRefreshToken] = useState();

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
  }

  const value = {
    token: authToken,
    username: username,
    refreshToken: refreshToken,
    isAuthed: !!authToken,
    authenticate: authenticate,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
