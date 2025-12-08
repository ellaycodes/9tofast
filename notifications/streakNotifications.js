import * as Notifications from "expo-notifications";

export async function scheduleStreakNotifications(times) {
  if (!Array.isArray(times)) return console.warn("Times must be an array");

  for (const time of times) {
    const [hour, minute] = time.split(":").map(Number);

    if (isNaN(hour) || isNaN(minute)) {
      console.warn("Invalid time format:", time);
      continue;
    }

    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? "am" : "pm";

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't let today slip",
        body: `It's ${displayHour}${period}! Open the app and keep the momentum you've built.`,
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
