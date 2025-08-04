import { useContext } from "react";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import { AuthContext } from "../../store/auth-context";
import { ScrollView, StyleSheet } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function ManageAccountScreen() {
  const authCxt = useContext(AuthContext);
  const { theme } = useAppTheme();

  function logoutHandler() {
    return authCxt.logout();
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
    </ScrollView>
  );
}

export default ManageAccountScreen;

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
});
