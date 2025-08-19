import { ADJECTIVES, NOUNS, VERBS } from "../constants/UsernameConstants";

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
