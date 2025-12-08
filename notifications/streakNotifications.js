import * as Notifications from "expo-notifications";
import randomNotificationMessage from "../util/randomNotificationMessage";

export async function scheduleStreakNotifications(times) {
  if (!Array.isArray(times)) return console.warn("Times must be an array");

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const time of times) {
    const [hour, minute] = time.split(":").map(Number);

    if (isNaN(hour) || isNaN(minute)) {
      console.warn("Invalid time format:", time);
      continue;
    }

    const category = hour < 12 ? "morning" : "evening";
    const { title, body } = randomNotificationMessage(category);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        vibrate: true,
        interruptionLevel: "timeSensitive",
      },
      trigger: {
        repeats: true,
        hour,
        minute,
        type: SchedulableTriggerInputTypes.DAILY,
      },
    });
  }
}
