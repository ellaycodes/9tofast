import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppTheme } from "../store/app-theme-context";
import Title from "../components/ui/Title";
import PrimaryButton from "../components/ui/PrimaryButton";
import { getAllAvatars } from "../assets/avatars";
import Avatar from "../components/ui/Avatar";
import { useEffect, useState } from "react";

function AvatarPickerModal({ showModal, onRequestClose, onSave }) {
  const { theme } = useAppTheme();
  const [avatars, setAvatars] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let mounted = true;
    getAllAvatars().then((list) => {
      if (mounted) setAvatars(list);
    });
    return () => {
      mounted = false;
    };
  }, [showModal]);

  function onSaveHandler() {
    if (!selectedId) return;
    onSave(selectedId);
  }

  function Item({ avatar }) {
    const isSelected = avatar.id === selectedId;
    return (
      <Pressable
        onPress={() => setSelectedId(avatar.id)}
        style={[
          { alignItems: "center", margin: 8, padding: 4, borderRadius: 12 },
          isSelected && { borderColor: theme.success, borderWidth: 4, borderRadius: 70 },
        ]}
      >
        <Avatar uri={avatar.uri} size={72} />
      </Pressable>
    );
  }

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <Pressable style={styles(theme).modalBackdrop} onPress={onRequestClose} />
      <View style={styles(theme).modalSheet}>
        <Title>Choose Avatar</Title>
        <FlatList
          data={avatars}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <Item avatar={item} />}
          numColumns={3}
          initialNumToRender={9}
          windowSize={5}
          removeClippedSubviews
          contentContainerStyle={{ paddingVertical: 12, justifyContent: 'center', alignItems: 'center' }}
        />
        <PrimaryButton onPress={onSaveHandler}>Save</PrimaryButton>
      </View>
    </Modal>
  );
}

export default AvatarPickerModal;

const styles = (theme) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    modalSheet: {
      backgroundColor: theme.card,
      paddingTop: 16,
      paddingHorizontal: 24,
      paddingBottom: 30,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      alignItems: "stretch",
    },
  });
