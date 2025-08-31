import { Image, StyleSheet, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import { SafeAreaView } from "react-native-safe-area-context";
import Title from "../ui/Title";
import { useMemo } from "react";

function Header({ children }) {
  const { theme } = useAppTheme();
  const memoStyle = useMemo(() => styles(theme), [theme]);
  return (
    <SafeAreaView style={memoStyle.container}>
      <View style={memoStyle.imageContainer}>
        <Title>{children}</Title>
        <Image
          source={require("../../assets/icon.png")}
          style={memoStyle.image}
        />
      </View>
    </SafeAreaView>
  );
}

export default Header;

const styles = (theme) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
    },
    imageContainer: {
      padding: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: 100,
      height: 100,
    },
  });
