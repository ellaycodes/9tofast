import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Colors } from "../constants/Colors";
import { auth } from "../firebase/app";
import { getPreferences, setThemeDb } from "../firebase/fasting.db.js";
import { onAuthStateChanged } from "firebase/auth";
import { logWarn } from "../util/logger";

export const AppThemeContext = createContext({
  themeName: "Original",
  theme: Colors.Original,
  setThemeName: () => {},
});

export default function AppThemeContextProvider({ children }) {
  const [theme, setTheme] = useState(Colors.Original);
  const [themeName, setThemeNameState] = useState("Original");
  const [loaded, setLoaded] = useState(false);

  const loadTheme = useCallback(async () => {
    try {
      let name;
      if (auth.currentUser) {
        const prefs = await getPreferences(auth.currentUser.uid);
        if (prefs && prefs.theme) {
          name = prefs.theme;
        }
      }
      if (!name) {
        name = await AsyncStorage.getItem("theme");
      }
      if (name && Colors[name]) {
        setTheme(Colors[name]);
        setThemeNameState(name);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let initialized = false;
    const init = async () => {
      await loadTheme();
      if (!initialized) {
        setLoaded(true);
        initialized = true;
      }
    };
    init();
    const unsub = onAuthStateChanged(auth, init);
    return unsub;
  }, [loadTheme]);

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
    } catch (error) {
      console.error("Failed to save theme:", error);
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
