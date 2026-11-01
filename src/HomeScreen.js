import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import { isoToDisplay } from './dates';
import { FONTS } from './fonts';
import { scoreText } from './matches';
import { RESULTS } from './results';

export default function HomeScreen({ stats, username }) {
  return (
    <ScrollView style={styles.screen}>
      <Header title="Hola 👋" subtitle={`@${username} · Así venís en la cancha`} />
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
            <RecordsCard bestMatch={stats.bestMatch} winStreak={stats.winStreak} />
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

function RecordsCard({ bestMatch, winStreak }) {
  return (
    <View style={styles.card}>
      <View style={styles.recordsTitleRow}>
        <Ionicons name="trophy" size={20} color="#e0a800" />
        <Text style={styles.recordsTitle}>Tus récords</Text>
      </View>
      <RecordRow
        icon="football"
        value={bestMatch ? bestMatch.goals : '–'}
        label="Más goles en un partido"
        detail={
          bestMatch
            ? [scoreText(bestMatch), bestMatch.group, isoToDisplay(bestMatch.date)].filter(Boolean).join(' · ')
            : 'Todavía no cargaste tus goles'
        }
      />
      <View style={styles.divider} />
      <RecordRow
        icon="flame"
        value={winStreak}
        label="Mejor racha ganando"
        detail={winStreak === 1 ? 'partido seguido' : 'partidos seguidos'}
      />
    </View>
  );
}

function RecordRow({ icon, value, label, detail }) {
  return (
    <View style={styles.recordRow}>
      <View style={styles.recordIcon}>
        <Ionicons name={icon} size={22} color="#1f7a4d" />
      </View>
      <View style={styles.recordInfo}>
        <Text style={styles.recordLabel}>{label}</Text>
        <Text style={styles.recordDetail}>{detail}</Text>
      </View>
      <Text style={styles.recordValue}>{value}</Text>
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
  bigNumber: { fontSize: 64, fontFamily: FONTS.extraBold, color: '#1f7a4d', lineHeight: 68 },
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
  recordsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  recordsTitle: { fontSize: 22, fontFamily: FONTS.bold },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e8f3ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: { flex: 1 },
  recordLabel: { fontSize: 15, fontWeight: '600', color: '#222' },
  recordDetail: { fontSize: 13, color: '#666', marginTop: 2 },
  recordValue: { fontSize: 40, fontFamily: FONTS.extraBold, color: '#1f7a4d' },
  divider: { height: 1, backgroundColor: '#eef0f2', marginVertical: 12 },
  statCard: { flex: 1 },
  statValue: { fontSize: 44, fontFamily: FONTS.extraBold, marginTop: 6, lineHeight: 48 },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 24, fontFamily: FONTS.bold, marginTop: 12 },
  emptyText: { fontSize: 15, color: '#666', marginTop: 6, textAlign: 'center' },
});
