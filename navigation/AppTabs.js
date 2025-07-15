import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TimerScreen from "../screens/TimerScreen";
import ProgressScreen from "../screens/ProgressScreen";
import SettingsStack from "./SettingsStack";

const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="TimerScreen" component={TimerScreen} />
      <Tab.Screen name="ProgressScreen" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}

export default AppTabs;
