import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomBar from './src/BottomBar';
import ChartsScreen from './src/ChartsScreen';
import FriendProfileScreen from './src/FriendProfileScreen';
import FriendsScreen from './src/FriendsScreen';
import GroupsScreen from './src/GroupsScreen';
import HistoryScreen from './src/HistoryScreen';
import HomeScreen from './src/HomeScreen';
import LoginScreen from './src/LoginScreen';
import MatchDetailScreen from './src/MatchDetailScreen';
import MatchForm from './src/MatchForm';
import MonthlyScreen from './src/MonthlyScreen';
import PressableScale from './src/PressableScale';
import ProfileScreen from './src/ProfileScreen';
import RecordScreen from './src/RecordScreen';
import UsernameScreen from './src/UsernameScreen';
import YearScreen from './src/YearScreen';
import {
  confirmMatch,
  createMatch,
  deleteMatch,
  fetchMyMatches,
  fetchProfile,
  leaveMatch,
  removeFriendship,
} from './src/api';
import { FONT_FILES } from './src/fonts';
import { recentGroups } from './src/groups';
import { requestNotificationPermission, rescheduleReminders } from './src/notifications';
import { bestGoalsMatch, computeStats } from './src/stats';
import { supabase } from './src/supabase';
import { ThemeProvider, useColors, useStyles } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Main() {
  const styles = useStyles(makeStyles);
  const [fontsLoaded] = useFonts(FONT_FILES);
  // undefined = still checking; null = logged out / no profile yet.
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  // Matches you confirmed (they count in your stats); null until loaded.
  const [matches, setMatches] = useState(null);
  // Matches friends added you to, waiting for you to confirm.
  const [pending, setPending] = useState([]);
  const [loadFailed, setLoadFailed] = useState(false);
  // 'home' | 'history' | 'friends' | 'profile' | 'new' | 'detail' | 'record' | 'friend' | 'monthly' | 'groups' | 'year' | 'charts'
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  // The friend whose profile is open: { id, username, friendshipId }
  const [selectedFriend, setSelectedFriend] = useState(null);
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
      if (loadedProfile) await reloadMatches();
      setProfile(loadedProfile);
    } catch {
      setLoadFailed(true);
    }
  }

  async function reloadMatches() {
    const [mine, waiting] = await Promise.all([
      fetchMyMatches(userId, 'confirmed'),
      fetchMyMatches(userId, 'pending'),
    ]);
    setMatches(mine);
    setPending(waiting);
    rescheduleReminders(mine, waiting);
  }

  // If saving fails this throws, and MatchForm shows the error.
  async function handleSave(form) {
    await createMatch(form);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Your first match can't beat a record, tying it doesn't count, and neither
    // does a match without recorded goals.
    const best = bestGoalsMatch(matches);
    if (best && form.goals !== null && form.goals > best.goals) {
      setNewRecord({ goals: form.goals, previousBest: best.goals });
      setScreen('record');
    } else {
      setScreen('home');
    }
    await reloadMatches();
  }

  // Shared by delete (creator), leave and confirm: run it, then reload everything.
  async function changeMatch(action, feedback) {
    try {
      await action();
      Haptics.notificationAsync(feedback);
      await reloadMatches();
    } catch {
      Alert.alert('No se pudo completar', 'Revisá tu conexión e intentá de nuevo.');
      throw new Error('Match change failed');
    }
  }

  async function handleDelete(id) {
    await changeMatch(() => deleteMatch(id), Haptics.NotificationFeedbackType.Warning);
    setScreen('history');
  }

  async function handleLeave(id) {
    await changeMatch(() => leaveMatch(id, userId), Haptics.NotificationFeedbackType.Warning);
    setScreen('history');
  }

  async function handleConfirm(id, goals) {
    await changeMatch(() => confirmMatch(id, goals), Haptics.NotificationFeedbackType.Success);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    rescheduleReminders([]);
  }

  function openMatch(id) {
    setSelectedId(id);
    setScreen('detail');
  }

  function openFriend(friend) {
    setSelectedFriend(friend);
    setScreen('friend');
  }

  async function handleRemoveFriend(friendshipId) {
    try {
      await removeFriendship(friendshipId);
    } catch {
      Alert.alert('No se pudo eliminar', 'Revisá tu conexión e intentá de nuevo.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setScreen('friends');
  }

  // Wait for the custom font and the saved login so nothing flashes.
  if (!fontsLoaded || session === undefined) return null;

  const selectedMatch = [...(matches ?? []), ...pending].find((m) => m.id === selectedId);

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
        myId={userId}
        groups={recentGroups(matches)}
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
  } else if (screen === 'monthly') {
    content = <MonthlyScreen matches={matches} onBack={() => setScreen('home')} />;
  } else if (screen === 'charts') {
    content = <ChartsScreen matches={matches} onBack={() => setScreen('home')} />;
  } else if (screen === 'groups') {
    content = <GroupsScreen matches={matches} onBack={() => setScreen('home')} />;
  } else if (screen === 'year') {
    content = <YearScreen matches={matches} myId={userId} onBack={() => setScreen('home')} />;
  } else if (screen === 'friend' && selectedFriend) {
    content = (
      <FriendProfileScreen
        friend={selectedFriend}
        myMatches={matches}
        onBack={() => setScreen('friends')}
        onRemove={handleRemoveFriend}
      />
    );
  } else if (screen === 'detail' && selectedMatch) {
    content = (
      <MatchDetailScreen
        match={selectedMatch}
        myId={userId}
        onBack={() => setScreen('history')}
        onDelete={handleDelete}
        onLeave={handleLeave}
      />
    );
  } else {
    content = (
      <>
        {screen === 'history' ? (
          <HistoryScreen
            matches={matches}
            pending={pending}
            onSelect={openMatch}
            onConfirm={handleConfirm}
            onLeave={handleLeave}
          />
        ) : screen === 'friends' ? (
          <FriendsScreen myId={userId} onOpenFriend={openFriend} />
        ) : screen === 'profile' ? (
          <ProfileScreen
            profile={profile}
            email={session.user.email}
            stats={computeStats(matches)}
            onAvatarChange={(url) => setProfile({ ...profile, avatar_url: url })}
            onProfileChange={setProfile}
            onRemindersChange={() => rescheduleReminders(matches, pending)}
            onSignOut={handleSignOut}
          />
        ) : (
          <HomeScreen
            stats={computeStats(matches)}
            matches={matches}
            myId={userId}
            username={profile.username}
            onOpenPro={setScreen}
          />
        )}
        <BottomBar current={screen} onNavigate={setScreen} onAdd={() => setScreen('new')} />
      </>
    );
  }

  return (
    <>
      <View style={styles.container}>{content}</View>
      <StatusBar style="light" />
    </>
  );
}

function Loading() {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

function LoadError({ onRetry }) {
  const styles = useStyles(makeStyles);
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

const makeStyles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', color: c.text },
  errorText: { fontSize: 15, color: c.muted, marginTop: 6, textAlign: 'center' },
  retryButton: {
    backgroundColor: c.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  retryText: { color: c.onPrimary, fontSize: 16, fontWeight: '700' },
});
