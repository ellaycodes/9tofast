import * as Notifications from "expo-notifications";

export async function allowNotificationsAsync() {
  let settings = await Notifications.getPermissionsAsync();

  if (
    !settings.granted &&
    settings.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    settings = await Notifications.requestPermissionsAsync();
  }

  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
