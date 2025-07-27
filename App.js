import { StatusBar } from "expo-status-bar";
import AuthStack from "./navigation/AuthStack";
import AppThemeContextProvider from "./store/app-theme-context";
import { useContext, useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AuthContextProvider, { AuthContext } from "./store/auth-context";
import { NavigationContainer } from "@react-navigation/native";
import AppTabs from "./navigation/AppTabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import FastingContextProvider from "./store/fastingLogic/fasting-context";
import { Ionicons } from "@expo/vector-icons";

function Navigator() {
  const authCxt = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Ionicons.loadFont();
    (async () => {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        authCxt.authenticate(storedToken);
      }

      setLoading(false);
    })();
  }, []);

  if (loading) {
    <LoadingOverlay>Loading</LoadingOverlay>;
  }

  return (
    <NavigationContainer>
      {authCxt.isAuthed ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <>
      <AuthContextProvider>
        <AppThemeContextProvider>
          <FastingContextProvider>
            <SafeAreaProvider>
              <StatusBar style="light" />
              <Navigator />
            </SafeAreaProvider>
          </FastingContextProvider>
        </AppThemeContextProvider>
      </AuthContextProvider>
    </>
  );
}
