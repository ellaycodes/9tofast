// /store/fasting-context.js
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const FastingContext = createContext({
  loading: true, // while AsyncStorage loads
  schedule: null, // { label, start, end } | null
  fastStartTime: null, // ms timestamp | null
  setSchedule: () => {},
  startFast: () => {},
  clearFast: () => {},
});

export default function FastingContextProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [fastStartTime, setFastStartTime] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // const raw = await AsyncStorage.getItem("fastingState_v1");
        // if (raw) {
        // const { schedule, fastStartTime } = JSON.parse(raw);
        if (schedule) setSchedule(schedule);
        if (fastStartTime) setFastStartTime(fastStartTime);
        // }
      } catch (err) {
        console.warn("Failed to load fasting state", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    // AsyncStorage.setItem(
    //   "fastingState_v1",
    //   JSON.stringify({ schedule, fastStartTime })
    // ).catch((err) => console.warn("Failed to persist fasting state", err));
  }, [schedule, fastStartTime, loading]);

  const memoSetSchedule = useCallback((schedule) => setSchedule(schedule), []);
  const startFast = useCallback(() => setFastStartTime(Date.now()), []);
  const clearFast = useCallback(() => {
    setFastStartTime(null);
    setSchedule(null);
  }, []);

  const value = {
    loading,
    schedule,
    fastStartTime,
    setSchedule: memoSetSchedule,
    startFast,
    clearFast,
  };

  return (
    <FastingContext.Provider value={value}>{children}</FastingContext.Provider>
  );
}

export const useFasting = () => useContext(FastingContext);
