export function logWarn(message, error) {
  if (__DEV__) {
    console.warn(message, error);
  }
}

export function logError(message, error) {
  if (__DEV__) {
    console.error(message, error);
  }
}