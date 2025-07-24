import { useContext } from "react";
import { Text, View } from "react-native";
import { AuthContext } from "../store/auth-context";
import { useFasting } from "../store/fasting-context";

function TimerScreen() {
  const authCxt = useContext(AuthContext);

  const { fastStartTime, schedule } = useFasting();

  const date = JSON.stringify(new Date(fastStartTime));

  const timerScreenInfo = JSON.stringify(schedule)

  return (
    <View>
      <Text>This is the timer screen!</Text>
      <Text>{authCxt.token}</Text>
      <Text>{date}</Text>
      <Text>{timerScreenInfo}</Text>
    </View>
  );
}

export default TimerScreen;
