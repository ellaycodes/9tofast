import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TimerScreen from "../screens/TimerScreen";
import ProgressScreen from "../screens/ProgressScreen";
import SettingsStack from "./SettingsStack";
import { Colors } from "../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../store/app-theme-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

function AppTabs() {
  const theme = Colors[useContext(AppThemeContext)];

  return (
    <Tab.Navigator
      screenOptions={{
        sceneStyle: {
          backgroundColor: theme.background,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
      }}
    >
      <Tab.Screen
        name="TimerScreen"
        component={TimerScreen}
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="timer" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProgressScreen"
        component={ProgressScreen}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default AppTabs;
