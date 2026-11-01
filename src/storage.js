import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'matches';

export async function loadMatches() {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

export async function saveMatches(matches) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}
