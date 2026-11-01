import AsyncStorage from '@react-native-async-storage/async-storage';

// Matches saved only on this phone, from before accounts existed.
// They are uploaded to the account once and then removed from here.
const STORAGE_KEY = 'matches';

export async function loadLocalMatches() {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

export async function clearLocalMatches() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
