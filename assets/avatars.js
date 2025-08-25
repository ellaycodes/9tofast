import AsyncStorage from "@react-native-async-storage/async-storage";

const MANIFEST_URL = "https://9toassets.netlify.app/manifest.json";
const AS_KEY = "manifest";

let cache;

export async function loadManifest() {
  if (cache) return cache;

  try {
    const res = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("manifest_fetch_failed");
    const json = await res.json();
    cache = json.avatars.map((a) => ({
      id: a.id,
      uri: json.baseUrl + a.path,
    }));
    await AsyncStorage.setItem(AS_KEY, JSON.stringify(json));
    return cache;
  } catch (err) {
    const cached = await AsyncStorage.getItem(AS_KEY);
    if (!cached) throw new Error("no_manifest_available");
    const json = JSON.parse(cached);
    cache = json.avatars.map((a) => ({
      id: a.id,
      uri: json.baseUrl + a.path,
    }));
    return cache;
  }
}

export async function getAllAvatars() {
  return await loadManifest();
}

export async function avatarUriById(id) {
  const list = await loadManifest();
  const found = list.find((a) => a.id === id);
  return found ? found.uri : null;
}
