import { useAppTheme } from "../../store/app-theme-context";
import { StyleSheet, View } from "react-native";
import Avatar from "./Avatar";
import { useState, useEffect } from "react";
import { avatarUriById } from "../../assets/avatars";

function AvatarSegment({ avatarId, small = false }) {
  const { theme } = useAppTheme();
  const [uri, setUri] = useState(null);

  useEffect(() => {
    let mounted = true;
    avatarUriById(avatarId).then((u) => {
      if (mounted) setUri(u);
    });
    return () => {
      mounted = false;
    };
  }, [avatarId]);

  return (
      <View style={styles(theme, small).editProfileContainer}>
        <Avatar uri={uri} small={small} />
      </View>
  );
}

export default AvatarSegment;

const styles = (theme, small) =>
  StyleSheet.create({
    profilePicContainer: {
      borderRadius: 70,
      backgroundColor: theme.secondary100,
      alignSelf: "center",
      padding: small ? 5 : 20,
      marginTop: 24,
    },
    editProfileContainer: {
      gap: 20,
    },
  });
