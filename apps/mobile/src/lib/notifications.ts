import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'daily-reminders';

/**
 * Creates the Android notification channel on app start.
 * No-op on iOS.
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

/**
 * Requests notification permissions and returns whether they were granted.
 */
export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedules a daily notification at the given time.
 * Content: "Time to explore! What will your family discover today?"
 * Repeats every day.
 */
export async function scheduleDailyReminder(time: {
  hour: number;
  minute: number;
}): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'The Hedge',
      body: 'Time to explore! What will your family discover today?',
      sound: 'default',
      data: { type: 'reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
      channelId: CHANNEL_ID,
    },
  });

  return id;
}

/**
 * Schedules a streak reminder notification for 6pm daily.
 * Content: "Your streak is at risk! Log an activity to keep it going."
 * Triggers every day at 18:00.
 */
export async function scheduleStreakReminder(): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Streak Alert',
      body: 'Your streak is at risk! Log an activity to keep it going.',
      sound: 'default',
      data: { type: 'reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
      channelId: CHANNEL_ID,
    },
  });

  return id;
}

/**
 * Schedules a weekly review notification for Sunday at 18:00.
 * Content: "Your week in review is ready. See how your family did!"
 * Repeats every Sunday.
 */
export async function scheduleWeeklyReview(): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Weekly Review',
      body: 'Your week in review is ready. See how your family did!',
      sound: 'default',
      data: { type: 'reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday (1 = Sunday in expo-notifications)
      hour: 18,
      minute: 0,
      channelId: CHANNEL_ID,
    },
  });

  return id;
}

/**
 * Cancels all currently scheduled notifications.
 */
export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Returns the list of all currently scheduled notifications.
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return Notifications.getAllScheduledNotificationsAsync();
}
