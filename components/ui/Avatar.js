import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../store/app-theme-context";
import { Image } from "expo-image";

function Avatar({ uri, size = 100, small = false }) {
  const { theme } = useAppTheme();

  small ? (size = 50) : size;

  return (
    <View
      style={[
        styles(theme).profilePicContainer,
        uri ? { padding: 4 } : { padding: 20 },
      ]}
    >
      {!uri ? (
        <MaterialIcons name="person-outline" size={size} color={theme.muted} />
      ) : (
        <Image
          source={{ uri }}
          style={{
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: (size * 1.2) / 2,
          }}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          transition={100}
        />
      )}
    </View>
  );
}

export default Avatar;

const styles = (theme) =>
  StyleSheet.create({
    profilePicContainer: {
      borderRadius: 100,
      backgroundColor: theme.secondary100,
      alignSelf: "center",
      padding: 10,
    },
  });
