import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsHomeScreen from "../screens/App/SettingsHomeScreen";
import ManageAccountScreen from "../screens/Settings/ManageAccountScreen";
import PremiumPaywallScreen from "../screens/PremiumPaywallScreen";
import AboutSupportScreen from "../screens/Settings/AboutSupportScreen";
import { useAppTheme } from "../store/app-theme-context";
import EditScheduleScreen from "../screens/Settings/EditScheduleScreen";
import EditThemeScreen from "../screens/Settings/EditThemeScreen";

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
      />
      <Stack.Screen name="AboutSupportScreen" component={AboutSupportScreen} />
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
    </Stack.Navigator>
  );
}

export default SettingsStack;
