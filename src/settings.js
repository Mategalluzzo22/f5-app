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

const THEME_MODE_KEY = 'settings.themeMode';
const THEME_MODES = ['auto', 'light', 'dark'];

// 'auto' (follow the phone) by default.
export async function loadThemeMode() {
  const mode = await AsyncStorage.getItem(THEME_MODE_KEY);
  return THEME_MODES.includes(mode) ? mode : 'auto';
}

export async function saveThemeMode(mode) {
  await AsyncStorage.setItem(THEME_MODE_KEY, mode);
}
