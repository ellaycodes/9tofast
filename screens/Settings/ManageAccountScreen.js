import { useContext } from "react";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import { AuthContext } from "../../store/auth-context";
import { ScrollView, StyleSheet } from "react-native";
import { useFasting } from "../../store/fastingLogic/fasting-context";

function ManageAccountScreen({ navigation }) {
  const authCxt = useContext(AuthContext);
  const { clearFast, setBaselineAnchor } = useFasting();

  function logoutHandler() {
    clearFast();
    return authCxt.logout();
  }

  function clearAllHandler() {
    clearFast();
    setBaselineAnchor(Date.now());
    navigation.navigate("TimerScreen");
  }

  return (
    <ScrollView style={styles.container}>
      <SettingsPressable
        icon="logout"
        onPress={logoutHandler}
        label="Logout"
        style={{
          justifyContent: "space-between",
          padding: 10,
          borderRadius: 10,
          marginBottom: 20,
        }}
      />
      <SettingsPressable
        icon="clear"
        onPress={clearAllHandler}
        label="Clear All"
        style={{
          justifyContent: "space-between",
          padding: 10,
          borderRadius: 10,
          marginBottom: 20,
        }}
      />
    </ScrollView>
  );
}

export default ManageAccountScreen;

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
});
