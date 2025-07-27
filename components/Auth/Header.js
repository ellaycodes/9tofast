import { Image, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import Title from "../ui/Title";

function Header({ children }) {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView style={styles(theme).container}>
      <View style={styles(theme).imageContainer}>
        <Title>{children}</Title>
        <Image
          source={require("../../assets/icon.png")}
          style={styles(theme).image}
        />
      </View>
    </SafeAreaView>
  );
}

export default Header;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      justifyContent: "center"
    },
    imageContainer: {
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center'
    },
    image: {
      width: 100,
      height: 100,
    },
  });
