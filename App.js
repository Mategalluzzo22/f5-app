import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomBar from './src/BottomBar';
import HistoryScreen from './src/HistoryScreen';
import HomeScreen from './src/HomeScreen';
import MatchDetailScreen from './src/MatchDetailScreen';
import MatchForm from './src/MatchForm';
import RecordScreen from './src/RecordScreen';
import { FONT_FILES } from './src/fonts';
import { recentOpponents } from './src/opponents';
import { bestGoalsMatch, computeStats } from './src/stats';
import { loadMatches, saveMatches } from './src/storage';

export default function App() {
  const [fontsLoaded] = useFonts(FONT_FILES);
  const [matches, setMatches] = useState([]);
  // 'home' | 'history' | 'new' | 'detail' | 'record'
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  // Set when a saved match beats the goals record: { goals, previousBest }
  const [newRecord, setNewRecord] = useState(null);

  useEffect(() => {
    loadMatches().then(setMatches);
  }, []);

  async function updateMatches(updated) {
    setMatches(updated);
    await saveMatches(updated);
  }

  async function handleSave(match) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Your first match can't beat a record, and tying it doesn't count.
    const best = bestGoalsMatch(matches);
    if (best && match.goals > best.goals) {
      setNewRecord({ goals: match.goals, previousBest: best.goals });
      setScreen('record');
    } else {
      setScreen('home');
    }
    await updateMatches([...matches, match]);
  }

  async function handleDelete(id) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setScreen('history');
    await updateMatches(matches.filter((m) => m.id !== id));
  }

  function openMatch(id) {
    setSelectedId(id);
    setScreen('detail');
  }

  // Wait for the custom font so text doesn't jump when it loads.
  if (!fontsLoaded) return null;

  const selectedMatch = matches.find((m) => m.id === selectedId);

  let content;
  if (screen === 'new') {
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
          <HomeScreen stats={computeStats(matches)} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
});
