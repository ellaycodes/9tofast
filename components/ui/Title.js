import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { useContext } from "react";
import { AppThemeContext } from "../../store/app-theme-context";

function Title({ children, style }) {
  const theme = Colors[useContext(AppThemeContext)]
  
  return (
    <View style={[styles(theme).container, style]}>
      <Text style={[styles(theme).titleText, style]}>{children}</Text>
    </View>
  );
}

export default Title;

const styles = (theme) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 18,
    alignItems: 'center',
    marginBottom: 4
  },
  titleText: {
    fontSize: 30,
    color: theme.text,
    fontWeight: 'bold',
    textAlign: 'center'
  }
})
