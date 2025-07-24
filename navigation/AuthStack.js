import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import OnboardingCarousel from "../screens/OnboardingCarousel";
import { Colors } from "../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../store/app-theme-context";
import PreAuthScreen from "../screens/PreAuthScreen";
import ForgottenPassword from "../screens/ForgottenPasswordScreen";

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
        name="PreAuthScreen"
        component={PreAuthScreen}
        options={{
          title: "9ToFast",
        }}
      />
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
      <Stack.Screen
        name="OnboardingCarousel"
        component={OnboardingCarousel}
        options={{
          title: "Welcome",
          headerBackVisible: false,
          headerTitleStyle: {
            fontSize: 20,
          },
        }}
      />
      <Stack.Screen
        name="ForgottenPassword"
        component={ForgottenPassword}
        options={{
          title: 'Forgotten Password'
        }}
      />
    </Stack.Navigator>
  );
}

export default AuthStack;
