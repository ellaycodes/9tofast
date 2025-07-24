import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useContext } from "react";
import { Pressable, View, Text } from "react-native";
import { AuthContext } from "../store/auth-context";

function SettingsHomeScreen() {
  const authCxt = useContext(AuthContext);

  function logoutHandler() {
    return authCxt.logout();
  }

  return (
    <View>
      <Pressable onPress={logoutHandler}>
      <Text>Text</Text>
      <Ionicons name="exit-outline" size={40} color="black" />
      <Text>Logout</Text>
      </Pressable>
    </View>
  );
}

export default SettingsHomeScreen;
