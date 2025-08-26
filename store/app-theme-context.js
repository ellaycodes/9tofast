import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Colors } from "../constants/Colors";
import { auth } from "../firebase/app";
import { getPreferences, setThemeDb } from "../firebase/fasting.db.js";

export const AppThemeContext = createContext({
  themeName: "Original",
  theme: Colors.Original,
  setThemeName: () => {},
});

export default function AppThemeContextProvider({ children }) {
  const [theme, setTheme] = useState(Colors.Original);
  const [themeName, setThemeNameState] = useState("Original");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await AsyncStorage.getItem("theme");
        // if (res && Colors[res]) {
        //   setTheme(Colors[res]);
        //   setThemeNameState(res);
        let name;
        if (auth.currentUser) {
          const prefs = await getPreferences(auth.currentUser.uid);
          name = prefs?.theme;
        }
        if (!name) {
          name = await AsyncStorage.getItem("theme");
        }
        if (name && Colors[name]) {
          setTheme(Colors[name]);
          setThemeNameState(name);
        }
      } catch (err) {
        console.error("Failed to load theme:", err);
      } finally {
        setLoaded(true);
      }
    }
    loadTheme();
  }, []);

  async function setThemeName(name) {
    if (!Colors[name]) {
      console.warn(`Unknown theme "${name}". Using original.`);
      name = "Original";
    }
    setTheme(Colors[name]);
    setThemeNameState(name);
    try {
      await AsyncStorage.setItem("theme", name);
      if (auth.currentUser) {
        await setThemeDb(auth.currentUser.uid, name);
      }
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  }

  const value = {
    themeName,
    theme,
    setThemeName,
  };

  if (!loaded) {
    return null;
  }

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(AppThemeContext);
