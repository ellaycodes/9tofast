import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsHomeScreen from "../screens/App/SettingsHomeScreen";
import ManageAccountScreen from "../screens/Settings/ManageAccountScreen";
import PremiumPaywallScreen from "../screens/Settings/PremiumPaywallScreen";
import AboutScreen from "../screens/Settings/AboutScreen";
import { useAppTheme } from "../store/app-theme-context";
import EditScheduleScreen from "../screens/Settings/EditScheduleScreen";
import EditThemeScreen from "../screens/Settings/EditThemeScreen";
import ProfileScreen from "../screens/Settings/ProfileScreen";
import SupportScreen from "../screens/Settings/SupportScreen";

const Stack = createNativeStackNavigator();

function SettingsStack() {
  const { theme } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.background,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
      }}
    >
      <Stack.Screen
        name="SettingsHomeScreen"
        component={SettingsHomeScreen}
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="ManageAccountScreen"
        component={ManageAccountScreen}
        options={{
          title: "Manage Account",
        }}
      />
      <Stack.Screen
        name="PremiumPaywallScreen"
        component={PremiumPaywallScreen}
        options={{
          title: "Premium",
        }}
      />
      <Stack.Screen name="AboutScreen" component={AboutScreen} options={{
          title: "About 9ToFast",
        }}/>
        <Stack.Screen name="SupportScreen" component={SupportScreen} options={{
          title: "Support",
        }}/>
      <Stack.Screen
        name="EditScheduleScreen"
        component={EditScheduleScreen}
        options={{
          title: "Edit Schedule",
        }}
      />
      <Stack.Screen
        name="EditThemeScreen"
        component={EditThemeScreen}
        options={{
          title: "Edit Theme",
        }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          title: "Profile",
        }}
      />
    </Stack.Navigator>
  );
}

export default SettingsStack;
