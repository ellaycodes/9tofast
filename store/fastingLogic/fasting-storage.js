import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "fastingState_v1";

export async function load() {
  try {
    const response = await AsyncStorage.getItem(KEY);
    if (!response) return { schedule: null, fastStartTime: null };

    return {
      schedule: JSON.parse(response).schedule ?? null,
      fastStartTime: JSON.parse(response).fastStartTime ?? null,
    };
  } catch (err) {
    console.warn("[fasting-storage] load() failed:", err);
    return { schedule: null, fastStartTime: null };
  }
}

export async function persist(state) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("[fasting-storage] persist() failed:", err);
  }
}
