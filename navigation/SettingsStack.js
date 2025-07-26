import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsHomeScreen from "../screens/SettingsHomeScreen";
import ManageAccountScreen from "../screens/ManageAccountScreen";
import PremiumPaywallScreen from "../screens/PremiumPaywallScreen";
import AboutSupportScreen from "../screens/AboutSupportScreen";
import SchedulePickerModal from "../modals/SchedulePickerModal";
import { Colors } from "../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../store/app-theme-context";

const Stack = createNativeStackNavigator();

function SettingsStack() {
  const theme = Colors[useContext(AppThemeContext)];
  
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen
        name="SettingsHomeScreen"
        component={SettingsHomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ManageAccountScreen"
        component={ManageAccountScreen}
      />
      <Stack.Screen
        name="PremiumPaywallScreen"
        component={PremiumPaywallScreen}
      />
      <Stack.Screen name="AboutSupportScreen" component={AboutSupportScreen} />
      <Stack.Screen
        name="SchedulePickerModal"
        component={SchedulePickerModal}
      />
      <Stack.Screen name="QuietHoursPicker" component={SchedulePickerModal} />
    </Stack.Navigator>
  );
}

export default SettingsStack;
