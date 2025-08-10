import { ADJECTIVES, NOUNS, VERBS } from "../constants/UsernameConstants";

function randomBase36Id(chars = 8) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  const bytesNeeded = Math.ceil(chars * 1.3);
  let id = "";

  if (globalThis.crypto && crypto.getRandomValues) {
    const buf = new Uint8Array(bytesNeeded);
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length && id.length < chars; i++) {
      const v = buf[i];
      if (v < 252) id += alphabet[v % 36];
    }
  } else {
    while (id.length < chars) {
      id += Math.random().toString(36).slice(2);
    }
    id = id.slice(0, chars);
  }
  return id;
}

function randomUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 10000);

  const includeVerb = Math.random() < 0.7;
  let username;

  if (includeVerb) {
    const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
    username = `@${adj}${noun}${verb}${num}`;
  } else {
    username = `@${adj}${noun}${num}`;
  }

  return username;
}

export default randomUsername;
