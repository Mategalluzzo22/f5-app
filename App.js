import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomBar from './src/BottomBar';
import HistoryScreen from './src/HistoryScreen';
import HomeScreen from './src/HomeScreen';
import MatchForm from './src/MatchForm';
import { recentOpponents } from './src/opponents';
import { computeStats } from './src/stats';
import { loadMatches, saveMatches } from './src/storage';

export default function App() {
  const [matches, setMatches] = useState([]);
  // 'home' | 'history' | 'new'
  const [screen, setScreen] = useState('home');

  useEffect(() => {
    loadMatches().then(setMatches);
  }, []);

  async function handleSave(match) {
    const updated = [...matches, match];
    setMatches(updated);
    setScreen('home');
    await saveMatches(updated);
  }

  return (
    <SafeAreaProvider>
      {screen === 'new' ? (
        <SafeAreaView style={styles.container}>
          <MatchForm
            opponents={recentOpponents(matches)}
            onSave={handleSave}
            onCancel={() => setScreen('home')}
          />
        </SafeAreaView>
      ) : (
        <View style={styles.container}>
          {screen === 'home' ? (
            <HomeScreen stats={computeStats(matches)} />
          ) : (
            <HistoryScreen matches={matches} />
          )}
          <BottomBar current={screen} onNavigate={setScreen} onAdd={() => setScreen('new')} />
        </View>
      )}
      <StatusBar style={screen === 'new' ? 'dark' : 'light'} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
});
