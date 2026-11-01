import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import { RESULTS } from './results';

export default function HomeScreen({ stats }) {
  return (
    <ScrollView style={styles.screen}>
      <Header title="Hola 👋" subtitle="Así venís en el F5" />
      <View style={styles.cards}>
        {stats.played === 0 ? (
          <View style={[styles.card, styles.emptyCard]}>
            <Ionicons name="football" size={40} color="#1f7a4d" />
            <Text style={styles.emptyTitle}>Todavía no cargaste partidos</Text>
            <Text style={styles.emptyText}>Tocá el botón verde de abajo para cargar el primero.</Text>
          </View>
        ) : (
          <>
            <WinRateCard stats={stats} />
            <View style={styles.row}>
              <StatCard icon="football" value={stats.goals} label={stats.goals === 1 ? 'gol' : 'goles'} />
              <StatCard icon="trending-up" value={stats.goalsPerMatch} label="goles por partido" />
            </View>
            <StatCard
              icon="calendar"
              value={stats.played}
              label={stats.played === 1 ? 'partido jugado' : 'partidos jugados'}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function WinRateCard({ stats }) {
  const counts = { win: stats.wins, draw: stats.draws, loss: stats.losses };
  return (
    <View style={styles.card}>
      <Text style={styles.bigNumber}>{stats.winRate}%</Text>
      <Text style={styles.cardLabel}>de victorias</Text>

      {/* One colored segment per result, sized by how many matches had it. */}
      <View style={styles.bar}>
        {Object.entries(counts)
          .filter(([, count]) => count > 0)
          .map(([key, count]) => (
            <View key={key} style={{ flex: count, backgroundColor: RESULTS[key].color }} />
          ))}
      </View>

      <View style={styles.legend}>
        {Object.entries(counts).map(([key, count]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: RESULTS[key].color }]} />
            <Text style={styles.legendText}>
              {count} {RESULTS[key].label.toLowerCase()}
              {count === 1 ? '' : 's'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <View style={[styles.card, styles.statCard]}>
      <Ionicons name={icon} size={22} color="#1f7a4d" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bigNumber: { fontSize: 48, fontWeight: '800', color: '#1f7a4d' },
  cardLabel: { fontSize: 14, color: '#666' },
  bar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 3,
    marginTop: 16,
  },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 14, color: '#333' },
  statCard: { flex: 1 },
  statValue: { fontSize: 32, fontWeight: '700', marginTop: 8 },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyText: { fontSize: 15, color: '#666', marginTop: 6, textAlign: 'center' },
});
