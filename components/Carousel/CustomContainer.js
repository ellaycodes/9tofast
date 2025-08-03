import { View, StyleSheet } from "react-native";
import { useAppTheme } from "../../store/app-theme-context";
import CustomSelector from "../ui/CustomSelector";

function CustomContainer({ startTime, endTime, onStartTimePress, onEndTimePress }) {
  const { theme } = useAppTheme();

  function onStartTimeSelect() {
    onStartTimePress();
  }

  function onEndTimeSelect() {
    onEndTimePress();
  }

  console.log('date in custom Container', startTime);
  

  return (
    <View style={styles(theme).customContainer}>
      <CustomSelector
        label="Start"
        time={startTime}
        onPress={onStartTimeSelect}
      />
      <CustomSelector label="End" time={endTime} onPress={onEndTimeSelect} />
    </View>
  );
}

export default CustomContainer;

const styles = (theme) =>
  StyleSheet.create({
    customContainer: {
      borderColor: theme.border,
      borderWidth: 2,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 8,
      marginTop: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
      backgroundColor: theme.card,
    },
  });
