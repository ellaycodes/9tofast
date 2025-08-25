import AsyncStorage from "@react-native-async-storage/async-storage";
import { getInitialState } from "./fasting-session";

const V2KEY = "fastingState_v2";

export async function load() {
  try {
    const rawV2 = await AsyncStorage.getItem(V2KEY);

    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      delete parsed.hours;
      return parsed;
    }

    return getInitialState();
  } catch (err) {
    console.warn("[fasting-storage] load() failed:", err);
    return getInitialState();
  }
}

export async function persist(state) {
  try {
    const { hours, ...persistable } = state;
    await AsyncStorage.setItem(V2KEY, JSON.stringify(persistable));
  } catch (err) {
    console.warn("[fasting-storage] persist() failed:", err);
  }
}
