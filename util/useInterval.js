import { useEffect, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";

export default function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  const isFocused = useIsFocused();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isFocused || delay === null) {
      return;
    }
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay, isFocused]);
}
