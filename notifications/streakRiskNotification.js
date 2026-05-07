import * as Notifications from "expo-notifications";
import { NOTIF_IDS } from "./ids.js";

export async function scheduleStreakRiskNotification(schedule) {
  if (!schedule?.start) return;

  const [h, m] = schedule.start.split(":").map(Number);
  const totalMinutes = h * 60 + m - 60;
  const safeMins = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(safeMins / 60);
  const minute = safeMins % 60;

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_IDS.STREAK_RISK,
    content: {
      title: "Your streak is at risk 🔥",
      body: "Keep fasting for 1 more hour to protect your streak.",
      interruptionLevel: "timeSensitive",
    },
    trigger: {
      repeats: true,
      hour,
      minute,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });
}

export async function cancelStreakRiskNotification() {
  await Notifications.cancelScheduledNotificationAsync(NOTIF_IDS.STREAK_RISK);
}
