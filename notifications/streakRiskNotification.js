import * as Notifications from "expo-notifications";
import { STREAK_RISK_NOTIF_IDS, NOTIF_IDS } from "./ids.js";
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
 * Schedules a weekly repeating notification 1 hour before the fasting deadline
 * (eating-window open time) to warn the streak is at risk.
 * One notification per fasting day; rest days receive no notification.
 * Cancels all prior streak-risk notifications before rescheduling.
 *
 * @param {import('../store/fastingLogic/data/weekly-schedule').WeeklySchedule} weeklySchedule
 */
export async function scheduleStreakRiskNotification(weeklySchedule) {
  if (!weeklySchedule) return;
  await cancelStreakRiskNotification();

  await Promise.allSettled(
    DAY_KEYS.map(async (dayKey) => {
      const config = weeklySchedule.days[dayKey];
      if (!config || config.type === "rest") return;

      const [h, m] = config.start.split(":").map(Number);
      const totalMinutes = h * 60 + m - 60;
      const safeMins = ((totalMinutes % 1440) + 1440) % 1440;
      const hour = Math.floor(safeMins / 60);
      const minute = safeMins % 60;

      await Notifications.scheduleNotificationAsync({
        identifier: STREAK_RISK_NOTIF_IDS[dayKey],
        content: {
          title: "Your streak is at risk 🔥",
          body: "Keep fasting for 1 more hour to protect your streak.",
          interruptionLevel: "timeSensitive",
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

export async function cancelStreakRiskNotification() {
  await Promise.allSettled([
    // Cancel the old single-ID daily notification for users upgrading from Phase 1
    Notifications.cancelScheduledNotificationAsync(NOTIF_IDS.STREAK_RISK),
    ...Object.values(STREAK_RISK_NOTIF_IDS).map((id) =>
      Notifications.cancelScheduledNotificationAsync(id)
    ),
  ]);
}
