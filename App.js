import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomBar from './src/BottomBar';
import HistoryScreen from './src/HistoryScreen';
import HomeScreen from './src/HomeScreen';
import MatchDetailScreen from './src/MatchDetailScreen';
import MatchForm from './src/MatchForm';
import { recentOpponents } from './src/opponents';
import { computeStats } from './src/stats';
import { loadMatches, saveMatches } from './src/storage';

export default function App() {
  const [matches, setMatches] = useState([]);
  // 'home' | 'history' | 'new' | 'detail'
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadMatches().then(setMatches);
  }, []);

  async function updateMatches(updated) {
    setMatches(updated);
    await saveMatches(updated);
  }

  async function handleSave(match) {
    setScreen('home');
    await updateMatches([...matches, match]);
  }

  async function handleDelete(id) {
    setScreen('history');
    await updateMatches(matches.filter((m) => m.id !== id));
  }

  function openMatch(id) {
    setSelectedId(id);
    setScreen('detail');
  }

  const selectedMatch = matches.find((m) => m.id === selectedId);

  let content;
  if (screen === 'new') {
    content = (
      <SafeAreaView style={styles.container}>
        <MatchForm
          opponents={recentOpponents(matches)}
          onSave={handleSave}
          onCancel={() => setScreen('home')}
        />
      </SafeAreaView>
    );
  } else if (screen === 'detail' && selectedMatch) {
    content = (
      <View style={styles.container}>
        <MatchDetailScreen
          match={selectedMatch}
          onBack={() => setScreen('history')}
          onDelete={handleDelete}
        />
      </View>
    );
  } else {
    content = (
      <View style={styles.container}>
        {screen === 'home' ? (
          <HomeScreen stats={computeStats(matches)} />
        ) : (
          <HistoryScreen matches={matches} onSelect={openMatch} />
        )}
        <BottomBar current={screen} onNavigate={setScreen} onAdd={() => setScreen('new')} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {content}
      <StatusBar style={screen === 'new' ? 'dark' : 'light'} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
});
