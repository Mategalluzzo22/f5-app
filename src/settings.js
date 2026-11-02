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

const YEAR_GOALS_KEY = 'settings.yearGoals';

// { year: '2026', goals: 30, matches: 40 } or null when never set.
export async function loadYearGoals() {
  try {
    return JSON.parse(await AsyncStorage.getItem(YEAR_GOALS_KEY));
  } catch {
    return null;
  }
}

export async function saveYearGoals(yearGoals) {
  await AsyncStorage.setItem(YEAR_GOALS_KEY, JSON.stringify(yearGoals));
}

const TEAM_COLOR_KEY = 'settings.teamColor';

// The id of a color in teamColors.js; Doparti green by default.
export async function loadTeamColor() {
  return (await AsyncStorage.getItem(TEAM_COLOR_KEY)) ?? 'green';
}

export async function saveTeamColor(id) {
  await AsyncStorage.setItem(TEAM_COLOR_KEY, id);
}
