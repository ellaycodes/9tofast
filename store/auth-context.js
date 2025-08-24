import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  token: "",
  username: "",
  emailAddress: "",
  isAuthed: false,
  uid: "",
  setEmailAddress: (emailAddress) => {},
  authenticate: (token, userName, uid) => {},
  logout: () => {},
  setTokens: (idToken) => {},
  updateUsername: (username) => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [uid, setUid] = useState();

  function setEmailAddress(email) {
    setEmail(email);
    AsyncStorage.setItem("emailAddress", email);
    return true;
  }

  function authenticate(token, userName, uid) {
    setAuthToken(token);
    setUsername(userName);
    setUid(uid);
    AsyncStorage.setItem("token", token);
    AsyncStorage.setItem("username", userName);
    AsyncStorage.setItem("uid", uid);
  }

  function logout() {
    setAuthToken(null);
    setUsername(null);
    setUid(null);
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("username");
    AsyncStorage.removeItem("emailAddress");
    AsyncStorage.removeItem("uid");
  }

  function setTokens(idToken) {
    setAuthToken(idToken);
    AsyncStorage.setItem("token", idToken);
  }

  function updateUsername(username) {
    setUsername(username);
    AsyncStorage.setItem("username", username);
  }

  const value = {
    token: authToken,
    username: username,
    emailAddress: email,
    isAuthed: !!authToken,
    uid: uid,
    setEmailAddress: setEmailAddress,
    authenticate: authenticate,
    logout: logout,
    setTokens: setTokens,
    updateUsername: updateUsername,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
