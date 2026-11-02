import AsyncStorage from '@react-native-async-storage/async-storage';

// Preferences stored on this phone (reminders are scheduled on the phone too).
const FUNNY_REMINDERS_KEY = 'settings.funnyReminders';

// On by default.
export async function loadFunnyReminders() {
  return (await AsyncStorage.getItem(FUNNY_REMINDERS_KEY)) !== 'off';
}

export async function saveFunnyReminders(enabled) {
  await AsyncStorage.setItem(FUNNY_REMINDERS_KEY, enabled ? 'on' : 'off');
}
