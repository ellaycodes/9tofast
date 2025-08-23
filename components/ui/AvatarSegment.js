import { MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../store/app-theme-context";
import { StyleSheet, View } from "react-native";
import FlatButton from "./FlatButton";

function AvatarSegment() {
  const { theme } = useAppTheme();

  return (
    <View>
        <View style={styles(theme).editProfileContainer}>
          <View style={styles(theme).profilePicContainer}>
            <MaterialIcons
              name="person-outline"
              size={100}
              color={theme.muted}
            />
          </View>
          <FlatButton onPress={() => console.log("TODO")}>
            Edit Avatar
          </FlatButton>
        </View>
    </View>
  );
}

export default AvatarSegment;

const styles = (theme) =>
  StyleSheet.create({
    profilePicContainer: {
      borderRadius: 70,
      backgroundColor: theme.secondary100,
      alignSelf: "center",
      padding: 20,
      marginTop: 24,
    },
    editProfileContainer: {
      gap: 20,
    },
  });
