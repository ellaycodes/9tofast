import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import OnboardingCarousel from "../screens/OnboardingCarousel";
import AppTabs from "./AppTabs";
import { Colors } from "../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../store/app-theme-context";

const Stack = createNativeStackNavigator();

function AuthStack() {
  const theme = Colors[useContext(AppThemeContext)];

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
        name="LoginScreen"
        component={LoginScreen}
        options={{
          title: "Log In",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SignupScreen"
        component={SignupScreen}
        options={{
          title: "Sign Up",
          headerShown: false,
        }}
      />
      <Stack.Screen name="OnboardingCarousel" component={OnboardingCarousel} />
    </Stack.Navigator>
  );
}

export default AuthStack;
