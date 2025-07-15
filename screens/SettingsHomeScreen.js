import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useContext } from "react";
import { Pressable, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../store/auth-context";

function SettingsHomeScreen() {
  const authCxt = useContext(AuthContext);

  function logoutHandler() {
    return authCxt.logout();
  }

  return (
      <Pressable onPress={logoutHandler}>
        <View>
          <View>
            <MaterialIcons name="logout" size={30} color="black" />
          </View>
          <View>
            <Text>Logout</Text>
          </View>
        </View>
      </Pressable>
  );
}

export default SettingsHomeScreen;
