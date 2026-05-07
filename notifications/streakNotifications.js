import * as Notifications from "expo-notifications";
import randomNotificationMessage from "../util/randomNotificationMessage";
import { NOTIF_IDS } from "./ids.js";

const SLOT_IDS = [NOTIF_IDS.STREAK_MORNING, NOTIF_IDS.STREAK_EVENING];

export async function scheduleStreakNotifications(times) {
  if (!Array.isArray(times)) return console.warn("Times must be an array");

  for (let i = 0; i < SLOT_IDS.length; i++) {
    await Notifications.cancelScheduledNotificationAsync(SLOT_IDS[i]);
  }

  for (let i = 0; i < times.length; i++) {
    const time = times[i];
    const [hour, minute] = time.split(":").map(Number);

    if (isNaN(hour) || isNaN(minute)) {
      console.warn("Invalid time format:", time);
      continue;
    }

    const category = hour < 12 ? "morning" : "evening";
    const { title, body } = randomNotificationMessage(category);

    await Notifications.scheduleNotificationAsync({
      identifier: SLOT_IDS[i] ?? `streak-slot-${i}`,
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
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
      },
    });
  }
}
