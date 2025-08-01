import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TimerScreen from "../screens/App/TimerScreen";
import ProgressScreen from "../screens/App/ProgressScreen";
import SettingsStack from "./SettingsStack";
import { useAppTheme } from "../store/app-theme-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { theme } = useAppTheme();

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
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.secondary100,
        },
      }}
    >
      <Tab.Screen
        name="TimerScreen"
        component={TimerScreen}
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
          tabBarLabel: 'Home',
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
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" color={color} size={size} />
          ),
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
}

export default AppTabs;
