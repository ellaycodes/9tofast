import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  token: "",
  username: "",
  isAuthed: false,
  authenticate: (token) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const [username, setUsername] = useState();

  function authenticate(token, userName) {
    setAuthToken(token);
    setUsername(userName);
    console.log(token);
    AsyncStorage.setItem("token", token);
    AsyncStorage.setItem("username", userName);
  }

  function logout() {
    setAuthToken(null);
    setUsername(null);
    AsyncStorage.removeItem("token");
  }

  const value = {
    token: authToken,
    username: username,
    isAuthed: !!authToken,
    authenticate: authenticate,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
