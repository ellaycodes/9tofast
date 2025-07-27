import { useContext } from "react";
import { Pressable, View, Text } from "react-native";
import { AuthContext } from "../store/auth-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "../store/app-theme-context";
import { useFasting } from "../store/fastingLogic/fasting-context";

function SettingsHomeScreen() {
  const { theme } = useAppTheme();
  const authCxt = useContext(AuthContext);
  const { schedule } = useFasting();

  function logoutHandler() {
    return authCxt.logout();
  }

  return (
    <View style={{ padding: 16 }}>
      <Pressable onPress={logoutHandler} style={{ flexDirection: "row" }}>
        <MaterialIcons name="logout" size={24} color={theme.text} />
        <Text style={{ color: theme.text, fontSize: 24 }}>Logout</Text>
      </Pressable>
    </View>
  );
}

export default SettingsHomeScreen;
