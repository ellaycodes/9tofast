import { PixelRatio } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";

// Point this to where your file actually is.
// If your file is at /avatars/manifest.v1.json, use that URL.
const MANIFEST_URL = "https://9toassets.netlify.app/manifest.json";

// Keep the key versioned to avoid stale cache issues when you bump the manifest.
const AS_KEY = "avatar_manifest_v1";

let cacheList = null;

// Small fetch with timeout
async function fetchJson(url, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    
    if (!res.ok) throw new Error("manifest_fetch_failed");
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Choose the best path for this device
function pickPath(paths, scale) {
  // Prefer WebP at the right density, then PNG, then any fallback
  if (scale >= 2) {
    return (
      paths["2xWebp"] ||
      paths["1xWebp"] ||
      paths["1xPng"]
    );
  }
  return (
      paths["2xWebp"] ||
      paths["1xWebp"] ||
      paths["1xPng"]
  );
}

// Convert manifest json to simple [{id, uri}] list
function buildList(json) {
  if (!json || !json.avatars || !json.baseUrl) throw new Error("bad_manifest");
  const scale = PixelRatio.get() || 1;
  return json.avatars.map((a) => {
    const path = pickPath(a.paths || {}, scale);
    if (!path) throw new Error(`missing_paths_for_${a.id}`);
    return { id: a.id, uri: json.baseUrl + path };
  });
}

export async function loadManifest() {
  if (cacheList) return cacheList;

  // Try network first
  try {
    const json = await fetchJson(MANIFEST_URL);
    const list = buildList(json);
    cacheList = list;
    // Store the full json so we can rebuild list for a different scale later if needed
    await AsyncStorage.setItem(AS_KEY, JSON.stringify(json));
    return list;
  } catch (e) {
    // Fallback to cached json
    const cached = await AsyncStorage.getItem(AS_KEY);
    if (!cached) throw e;
    const json = JSON.parse(cached);
    const list = buildList(json);
    cacheList = list;
    return list;
  }
}

export async function getAllAvatars() {
  return loadManifest();
}

export async function avatarUriById(id) {
  const list = await loadManifest();
  const found = list.find((a) => a.id === id);
  return found ? found.uri : null;
}

// Optional: warm HTTP cache and image cache for the first N items
export async function prefetchAvatars(limit = 12) {
  const list = await loadManifest();
  const batch = list.slice(0, limit);
  await Promise.allSettled(
    batch.map((a) => Asset.fromURI(a.uri).downloadAsync())
  );
}
