import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import ProBadge from './ProBadge';
import PressableScale from './PressableScale';
import { isoToDisplay } from './dates';
import { FONTS } from './fonts';
import { formSentence, recentForm } from './insights';
import { scoreText } from './matches';
import { RESULTS } from './results';
import { useColors, useStyles } from './theme';

export default function HomeScreen({ stats, matches, username, onOpenPro }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  return (
    <ScrollView style={styles.screen}>
      <Header title="Hola 👋" subtitle={`@${username} · Así venís en la cancha`} />
      <View style={styles.cards}>
        {stats.played === 0 ? (
          <View style={[styles.card, styles.emptyCard]}>
            <Ionicons name="football" size={40} color={colors.accent} />
            <Text style={styles.emptyTitle}>Todavía no cargaste partidos</Text>
            <Text style={styles.emptyText}>Tocá el botón verde de abajo para cargar el primero.</Text>
          </View>
        ) : (
          <>
            <WinRateCard stats={stats} />
            <FormCard matches={matches} />
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
            <ProCard onOpen={onOpenPro} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

// Your last 5 results and the streak you're on (free for everyone).
function FormCard({ matches }) {
  const styles = useStyles(makeStyles);
  const { last, streak } = recentForm(matches);
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>Tu forma</Text>
      </View>
      <View style={styles.formRow}>
        {last.map((result, i) => (
          <View key={i} style={[styles.formBadge, { backgroundColor: RESULTS[result].color }]}>
            <Text style={styles.formBadgeText}>{RESULTS[result].short}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.formText}>{formSentence(streak)}</Text>
    </View>
  );
}

const PRO_SCREENS = [
  ['monthly', 'calendar-number', 'Tu mes a mes', 'Tus mejores meses y un calendario de tus partidos'],
  ['charts', 'stats-chart', 'Tus gráficos', 'Tu evolución en la cancha'],
  ['groups', 'people', 'Tus grupos', 'Cómo te va con cada grupo'],
  ['year', 'sparkles', 'Tu año en Doparti', 'El resumen de tu año futbolero'],
];

// Pro: the screens with more analysis of your matches.
function ProCard({ onOpen }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>Doparti</Text>
        <ProBadge />
      </View>
      {PRO_SCREENS.map(([screen, icon, label, detail], i) => (
        <View key={screen}>
          {i > 0 ? <View style={styles.divider} /> : null}
          <PressableScale style={styles.recordRow} onPress={() => onOpen(screen)}>
            <View style={styles.recordIcon}>
              <Ionicons name={icon} size={22} color={colors.accent} />
            </View>
            <View style={styles.recordInfo}>
              <Text style={styles.recordLabel}>{label}</Text>
              <Text style={styles.recordDetail}>{detail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.faint} />
          </PressableScale>
        </View>
      ))}
    </View>
  );
}

function WinRateCard({ stats }) {
  const styles = useStyles(makeStyles);
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
  const styles = useStyles(makeStyles);
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
  const styles = useStyles(makeStyles);
  const colors = useColors();
  return (
    <View style={styles.recordRow}>
      <View style={styles.recordIcon}>
        <Ionicons name={icon} size={22} color={colors.accent} />
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
  const styles = useStyles(makeStyles);
  const colors = useColors();
  return (
    <View style={[styles.card, styles.statCard]}>
      <Ionicons name={icon} size={22} color={colors.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bigNumber: { fontSize: 64, fontFamily: FONTS.extraBold, color: c.accent, lineHeight: 68 },
  cardLabel: { fontSize: 14, color: c.muted },
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
  legendText: { fontSize: 14, color: c.textSoft },
  recordsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  recordsTitle: { fontSize: 22, fontFamily: FONTS.bold, color: c.text },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: { flex: 1 },
  recordLabel: { fontSize: 15, fontWeight: '600', color: c.text },
  recordDetail: { fontSize: 13, color: c.muted, marginTop: 2 },
  recordValue: { fontSize: 40, fontFamily: FONTS.extraBold, color: c.accent },
  divider: { height: 1, backgroundColor: c.divider, marginVertical: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 22, fontFamily: FONTS.bold, color: c.text },
  formRow: { flexDirection: 'row', gap: 8 },
  formBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  formBadgeText: { color: c.onPrimary, fontFamily: FONTS.extraBold, fontSize: 20 },
  formText: { fontSize: 15, fontWeight: '600', color: c.textSoft, marginTop: 12 },
  statCard: { flex: 1 },
  statValue: { fontSize: 44, fontFamily: FONTS.extraBold, marginTop: 6, lineHeight: 48, color: c.text },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 24, fontFamily: FONTS.bold, marginTop: 12, color: c.text },
  emptyText: { fontSize: 15, color: c.muted, marginTop: 6, textAlign: 'center' },
});
