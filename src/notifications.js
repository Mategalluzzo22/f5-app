import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { planReminders } from './reminders';

// Local notifications only exist on phones; on web these functions do nothing.
const SUPPORTED = Platform.OS !== 'web';

if (SUPPORTED) {
  // Show reminders even if they arrive while the app is open.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// iOS only shows the permission prompt the first time; later calls just return the answer.
export async function requestNotificationPermission() {
  if (!SUPPORTED) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await Notifications.requestPermissionsAsync();
}

// Replaces every scheduled reminder with a fresh set based on the current matches.
export async function rescheduleReminders(matches) {
  if (!SUPPORTED) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const reminders = planReminders(matches);
  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: { title: reminder.title, body: reminder.body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.date },
    });
  }
  if (__DEV__) {
    console.log(
      `[reminders] ${reminders.length} scheduled:`,
      reminders.map((r) => `${r.date.toLocaleString()} ${r.title}`),
    );
  }
}
