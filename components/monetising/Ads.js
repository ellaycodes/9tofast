import { AntDesign } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";

function Ads() {
  const { theme } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 18,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 18 }}>Ad Placeholder</Text>
      <AntDesign name="right" color={theme.text} size={20} />
    </View>
  );
}

export default Ads;
