import { useContext } from "react";
import SettingsPressable from "../../components/Settings/SettingsPressable";
import { AuthContext } from "../../store/auth-context";

function ManageAccountScreen() {
  const authCxt = useContext(AuthContext);
  function logoutHandler() {
    return authCxt.logout();
  }
  return (
    <SettingsPressable icon="logout" onPress={logoutHandler} label="Logout" />
  );
}

export default ManageAccountScreen;
