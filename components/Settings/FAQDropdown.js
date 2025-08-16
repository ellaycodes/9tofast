import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import { useState } from "react";
import Answer from "./Answer";

function FAQDropdown({ children, answer }) {
  const { theme } = useAppTheme();

  const [openAnswer, setOpenAnswer] = useState(false);

  function toggleAnswer() {
    setOpenAnswer(!openAnswer);
  }

  return (
    <View>
      <Pressable onPress={toggleAnswer}>
        <View style={styles(theme).container}>
          <Text style={styles(theme).text}>{children}</Text>
          <Ionicons name="chevron-down" size={18} color={theme.text} />
        </View>
      </Pressable>

      {openAnswer && <Answer>{answer}</Answer>}
    </View>
  );
}

export default FAQDropdown;

const styles = (theme) =>
  StyleSheet.create({
    text: {
      color: theme.text,
      fontSize: 16,
    },
    container: {
      borderColor: theme.primary100,
      borderWidth: 1,
      borderRadius: 12,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 8,
    },
  });
