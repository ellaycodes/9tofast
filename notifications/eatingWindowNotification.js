import * as Notifications from "expo-notifications";
import { NOTIF_IDS } from "./ids.js";

export async function scheduleEatingWindowNotification(schedule) {
  if (!schedule?.start) return;

  const [h, m] = schedule.start.split(":").map(Number);
  const totalMinutes = h * 60 + m - 15;
  const safeMins = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(safeMins / 60);
  const minute = safeMins % 60;

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_IDS.EATING_WINDOW,
    content: {
      title: "Eating window opens soon",
      body: "Your eating window opens in 15 minutes.",
      interruptionLevel: "active",
    },
    trigger: {
      repeats: true,
      hour,
      minute,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });
}

export async function cancelEatingWindowNotification() {
  await Notifications.cancelScheduledNotificationAsync(
    NOTIF_IDS.EATING_WINDOW
  );
}
