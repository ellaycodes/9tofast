import AsyncStorage from "@react-native-async-storage/async-storage";
import { getInitialState } from "./fasting-session";

const V2KEY = "fastingState_v2";

// Input: none
// Output:
// {
//   schedule: { label: 'Custom', start: ..., end: ... },
//   events: [{ type: 'start', ts: 1753576789098 }]
// }
export async function load() {
  try {
    const rawV2 = await AsyncStorage.getItem(V2KEY);
    if (rawV2) {
      return JSON.parse(rawV2);
    }

    return getInitialState();
  } catch (err) {
    console.warn("[fasting-storage] load() failed:", err);
    return getInitialState();
  }
}

// Input:
// persist({
//   schedule: { label: '16:8', start: ..., end: ... },
//   events: [{ type: 'start', ts: 1234567890 }]
// })

// Output:
// → saves to AsyncStorage

export async function persist(state) {
  try {
    await AsyncStorage.setItem(V2KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("[fasting-storage] persist() failed:", err);
  }
}
