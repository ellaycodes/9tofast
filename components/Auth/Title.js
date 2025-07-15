import { Image, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../../store/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";

function Title({ children }) {
  const theme = Colors[useContext(AppThemeContext)];
  return (
    <SafeAreaView style={styles(theme).container}>
      <Image
        source={require("../../assets/icon.png")}
        style={styles(theme).image}
      />
      {/* <Text style={styles(theme).header}>{children}</Text> */}
    </SafeAreaView>
  );
}

export default Title;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: 100,
      height: 100
    },
    header: {
      fontSize: 30,
      color: theme.text,
    },
  });
