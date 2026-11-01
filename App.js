import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomBar from './src/BottomBar';
import HistoryScreen from './src/HistoryScreen';
import HomeScreen from './src/HomeScreen';
import LoginScreen from './src/LoginScreen';
import MatchDetailScreen from './src/MatchDetailScreen';
import MatchForm from './src/MatchForm';
import PressableScale from './src/PressableScale';
import RecordScreen from './src/RecordScreen';
import UsernameScreen from './src/UsernameScreen';
import { addMatch, deleteMatch, fetchMatches, fetchProfile, migrateLocalMatches } from './src/api';
import { FONT_FILES } from './src/fonts';
import { requestNotificationPermission, rescheduleReminders } from './src/notifications';
import { recentOpponents } from './src/opponents';
import { bestGoalsMatch, computeStats } from './src/stats';
import { supabase } from './src/supabase';

export default function App() {
  const [fontsLoaded] = useFonts(FONT_FILES);
  // undefined = still checking; null = logged out / no profile yet.
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  // null until the account's matches are loaded.
  const [matches, setMatches] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // 'home' | 'history' | 'new' | 'detail' | 'record'
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  // Set when a saved match beats the goals record: { goals, previousBest }
  const [newRecord, setNewRecord] = useState(null);

  const userId = session?.user.id;

  useEffect(() => {
    requestNotificationPermission();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => data.subscription.unsubscribe();
  }, []);

  // Start fresh whenever a different user logs in (or everyone logs out).
  useEffect(() => {
    setProfile(undefined);
    setMatches(null);
    setScreen('home');
    if (userId) loadAccount();
  }, [userId]);

  async function loadAccount() {
    setLoadFailed(false);
    try {
      const loadedProfile = await fetchProfile(userId);
      if (loadedProfile) {
        await migrateLocalMatches();
        const loaded = await fetchMatches();
        setMatches(loaded);
        rescheduleReminders(loaded);
      }
      setProfile(loadedProfile);
    } catch {
      setLoadFailed(true);
    }
  }

  function updateMatches(updated) {
    setMatches(updated);
    rescheduleReminders(updated);
  }

  // If saving fails this throws, and MatchForm shows the error.
  async function handleSave(match) {
    const saved = await addMatch(match);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Your first match can't beat a record, and tying it doesn't count.
    const best = bestGoalsMatch(matches);
    if (best && saved.goals > best.goals) {
      setNewRecord({ goals: saved.goals, previousBest: best.goals });
      setScreen('record');
    } else {
      setScreen('home');
    }
    updateMatches([...matches, saved]);
  }

  async function handleDelete(id) {
    try {
      await deleteMatch(id);
    } catch {
      Alert.alert('No se pudo eliminar', 'Revisá tu conexión e intentá de nuevo.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setScreen('history');
    updateMatches(matches.filter((m) => m.id !== id));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    rescheduleReminders([]);
  }

  function openMatch(id) {
    setSelectedId(id);
    setScreen('detail');
  }

  // Wait for the custom font and the saved login so nothing flashes.
  if (!fontsLoaded || session === undefined) return null;

  const selectedMatch = matches?.find((m) => m.id === selectedId);

  let content;
  if (!session) {
    content = <LoginScreen />;
  } else if (loadFailed) {
    content = <LoadError onRetry={loadAccount} />;
  } else if (profile === undefined) {
    content = <Loading />;
  } else if (profile === null) {
    content = <UsernameScreen userId={userId} onCreated={loadAccount} />;
  } else if (matches === null) {
    content = <Loading />;
  } else if (screen === 'new') {
    content = (
      <MatchForm
        opponents={recentOpponents(matches)}
        onSave={handleSave}
        onCancel={() => setScreen('home')}
      />
    );
  } else if (screen === 'record' && newRecord) {
    content = (
      <RecordScreen
        goals={newRecord.goals}
        previousBest={newRecord.previousBest}
        onClose={() => setScreen('home')}
      />
    );
  } else if (screen === 'detail' && selectedMatch) {
    content = (
      <MatchDetailScreen
        match={selectedMatch}
        onBack={() => setScreen('history')}
        onDelete={handleDelete}
      />
    );
  } else {
    content = (
      <>
        {screen === 'home' ? (
          <HomeScreen
            stats={computeStats(matches)}
            username={profile.username}
            onSignOut={handleSignOut}
          />
        ) : (
          <HistoryScreen matches={matches} onSelect={openMatch} />
        )}
        <BottomBar current={screen} onNavigate={setScreen} onAdd={() => setScreen('new')} />
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>{content}</View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1f7a4d" />
    </View>
  );
}

function LoadError({ onRetry }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>No pudimos cargar tus partidos</Text>
      <Text style={styles.errorText}>Revisá tu conexión a internet.</Text>
      <PressableScale style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Reintentar</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  errorText: { fontSize: 15, color: '#666', marginTop: 6, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#1f7a4d',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
