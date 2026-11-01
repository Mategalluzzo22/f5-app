import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MatchForm from './src/MatchForm';
import { isoToDisplay } from './src/dates';
import { RESULTS } from './src/results';
import { computeStats } from './src/stats';
import { loadMatches, saveMatches } from './src/storage';

export default function App() {
  const [matches, setMatches] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadMatches().then(setMatches);
  }, []);

  async function handleSave(match) {
    const updated = [...matches, match];
    setMatches(updated);
    setIsAdding(false);
    await saveMatches(updated);
  }

  const stats = computeStats(matches);
  // Newest first.
  const sortedMatches = [...matches].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {isAdding ? (
          <MatchForm onSave={handleSave} onCancel={() => setIsAdding(false)} />
        ) : (
          <>
            <FlatList
              data={sortedMatches}
              keyExtractor={(m) => m.id}
              contentContainerStyle={styles.list}
              ListHeaderComponent={<StatsSummary stats={stats} />}
              ListEmptyComponent={
                <Text style={styles.empty}>Todavía no cargaste partidos.</Text>
              }
              renderItem={({ item }) => <MatchRow match={item} />}
            />
            <Pressable style={styles.addButton} onPress={() => setIsAdding(true)}>
              <Text style={styles.addText}>+ Nuevo partido</Text>
            </Pressable>
          </>
        )}
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function StatsSummary({ stats }) {
  return (
    <View>
      <Text style={styles.title}>Mis partidos</Text>
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <Stat label="Jugados" value={stats.played} />
          <Stat label="Ganados" value={stats.wins} color={RESULTS.win.color} />
          <Stat label="Empatados" value={stats.draws} color={RESULTS.draw.color} />
          <Stat label="Perdidos" value={stats.losses} color={RESULTS.loss.color} />
        </View>
        <View style={styles.statsRow}>
          <Stat label="% victorias" value={`${stats.winRate}%`} />
          <Stat label="Goles" value={stats.goals} />
          <Stat label="Goles x partido" value={stats.goalsPerMatch} />
        </View>
      </View>
      <Text style={styles.sectionTitle}>Historial</Text>
    </View>
  );
}

function Stat({ label, value, color = '#111' }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MatchRow({ match }) {
  const result = RESULTS[match.result];
  return (
    <View style={styles.matchRow}>
      <View style={[styles.badge, { backgroundColor: result.color }]}>
        <Text style={styles.badgeText}>{result.short}</Text>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.opponent}>vs {match.opponent}</Text>
        <Text style={styles.date}>{isoToDisplay(match.date)}</Text>
      </View>
      <Text style={styles.matchGoals}>
        {match.goals} {match.goals === 1 ? 'gol' : 'goles'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  list: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  statsCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 16 },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 10 },
  empty: { color: '#666', fontSize: 15, textAlign: 'center', marginTop: 20 },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  matchInfo: { flex: 1 },
  opponent: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 13, color: '#666', marginTop: 2 },
  matchGoals: { fontSize: 15, fontWeight: '600', color: '#1f7a4d' },
  addButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30,
    backgroundColor: '#1f7a4d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
