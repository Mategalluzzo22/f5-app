import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import { isoToDisplay } from './dates';
import { RESULTS } from './results';

export default function HistoryScreen({ matches, onSelect }) {
  // Newest first.
  const sortedMatches = [...matches].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.screen}>
      <Header
        title="Partidos"
        subtitle={`${matches.length} ${matches.length === 1 ? 'partido' : 'partidos'}`}
      />
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={sortedMatches}
        keyExtractor={(m) => m.id}
        ListEmptyComponent={
          <View style={styles.matchRow}>
            <Text style={styles.empty}>Todavía no cargaste partidos.</Text>
          </View>
        }
        renderItem={({ item }) => <MatchRow match={item} onPress={() => onSelect(item.id)} />}
      />
    </View>
  );
}

function MatchRow({ match, onPress }) {
  const result = RESULTS[match.result];
  return (
    <Pressable style={styles.matchRow} onPress={onPress}>
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
      <Ionicons name="chevron-forward" size={18} color="#b0b5bc" style={styles.chevron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { marginTop: -32 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { color: '#666', fontSize: 15, flex: 1, textAlign: 'center' },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
  chevron: { marginLeft: 6 },
});
