import { StyleSheet, Text, View } from "react-native";
import Title from "../../components/ui/Title";
import AuthForm from "../../components/Auth/AuthForm";
import { MaterialIcons } from "@expo/vector-icons";
import SubtitleText from "../../components/ui/SubtitleText";
import { useAppTheme } from "../../store/app-theme-context";

function ProfileScreen({ route }) {
  const { emailAddress } = route.params;
  const { theme } = useAppTheme();

  return (
    <View style={styles(theme).containter}>
      {emailAddress ? (
        <View>
          <Title>{emailAddress}</Title>
        </View>
      ) : (
        <View>
          <View style={styles(theme).profilePicContainer}>
            <MaterialIcons name="person-outline" size={100} color={theme.muted} />
          </View>
          <Title style={{ fontSize: 20, paddingBottom: 0, marginBottom: 0 }}>
            Create An Account
          </Title>
          <SubtitleText muted style={{ paddingTop: 0, marginTop: 2 }} size="l">
            @user1234567
          </SubtitleText>
          <AuthForm />
        </View>
      )}
    </View>
  );
}

export default ProfileScreen;

const styles = (theme) =>
  StyleSheet.create({
    containter: {
      margin: 20,
    },
    profilePicContainer: {
      borderRadius: 70,
      backgroundColor: theme.secondary100,
      alignSelf: "center",
      padding: 20,
    },
  });
