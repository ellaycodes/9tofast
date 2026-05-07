import * as Notifications from "expo-notifications";
import { EATING_WINDOW_NOTIF_IDS, NOTIF_IDS } from "./ids.js";
import { DAY_KEYS } from "../store/fastingLogic/data/weekly-schedule.js";

// expo-notifications weekday convention: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
const DAY_TO_WEEKDAY = {
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
};

/**
 * Schedules a weekly repeating notification 15 minutes before the eating window
 * opens, one notification per fasting day.  Rest days receive no notification.
 * Cancels all prior eating-window notifications before rescheduling.
 *
 * @param {import('../store/fastingLogic/data/weekly-schedule').WeeklySchedule} weeklySchedule
 */
export async function scheduleEatingWindowNotification(weeklySchedule) {
  if (!weeklySchedule) return;
  await cancelEatingWindowNotification();

  await Promise.allSettled(
    DAY_KEYS.map(async (dayKey) => {
      const config = weeklySchedule.days[dayKey];
      if (!config || config.type === "rest") return;

      const [h, m] = config.start.split(":").map(Number);
      const totalMinutes = h * 60 + m - 15;
      const safeMins = ((totalMinutes % 1440) + 1440) % 1440;
      const hour = Math.floor(safeMins / 60);
      const minute = safeMins % 60;

      await Notifications.scheduleNotificationAsync({
        identifier: EATING_WINDOW_NOTIF_IDS[dayKey],
        content: {
          title: "Eating window opens soon",
          body: "Your eating window opens in 15 minutes.",
          interruptionLevel: "active",
        },
        trigger: {
          repeats: true,
          weekday: DAY_TO_WEEKDAY[dayKey],
          hour,
          minute,
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        },
      });
    })
  );
}

export async function cancelEatingWindowNotification() {
  await Promise.allSettled([
    // Cancel the old single-ID daily notification for users upgrading from Phase 1
    Notifications.cancelScheduledNotificationAsync(NOTIF_IDS.EATING_WINDOW),
    ...Object.values(EATING_WINDOW_NOTIF_IDS).map((id) =>
      Notifications.cancelScheduledNotificationAsync(id)
    ),
  ]);
}
