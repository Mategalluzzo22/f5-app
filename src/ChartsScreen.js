import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import Header from './Header';
import { formatStats, lastGoals, monthlySeries, winRateTrend } from './chartData';
import { MONTHS, todayISO } from './dates';
import { FONTS } from './fonts';
import { monthKey } from './monthly';
import { RESULTS } from './results';
import { useColors, useStyles } from './theme';

const BAR_AREA = 120;
const LINE_HEIGHT = 140;

// "Tus gráficos" (Pro): your numbers over time.
export default function ChartsScreen({ matches, onBack }) {
  const styles = useStyles(makeStyles);
  return (
    <ScrollView style={styles.screen}>
      <Header title="Tus gráficos" subtitle="Doparti Pro · Tu evolución en la cancha" onBack={onBack} />
      <View style={styles.cards}>
        <ChartCard title="Partidos y goles por mes" subtitle="Últimos 12 meses">
          <MonthlyBars series={monthlySeries(matches, monthKey(todayISO()))} />
        </ChartCard>
        <ChartCard title="Tu % de victorias" subtitle="Cómo fue cambiando partido a partido">
          <WinRateLine points={winRateTrend(matches)} />
        </ChartCard>
        <ChartCard title="Tus goles" subtitle="Últimos 10 partidos">
          <GoalBars points={lastGoals(matches)} />
        </ChartCard>
        <ChartCard title="Por formato" subtitle="Cómo te va en cada cancha">
          <FormatRows formats={formatStats(matches)} />
        </ChartCard>
      </View>
    </ScrollView>
  );
}

function ChartCard({ title, subtitle, children }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      {children}
    </View>
  );
}

// Two bars per month: matches (green) and goals (gold).
function MonthlyBars({ series }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  const max = Math.max(1, ...series.flatMap((m) => [m.played, m.goals]));
  const height = (value) => (value / max) * BAR_AREA;
  return (
    <>
      <View style={styles.barArea}>
        {series.map((month) => (
          <View key={month.key} style={styles.monthColumn}>
            <View style={styles.monthBars}>
              <View style={[styles.thinBar, { height: height(month.played), backgroundColor: colors.accent }]} />
              <View style={[styles.thinBar, { height: height(month.goals), backgroundColor: colors.gold }]} />
            </View>
            <Text style={styles.axisLabel}>{MONTHS[Number(month.key.slice(5)) - 1][0].toUpperCase()}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Legend color={colors.accent} label="Partidos" />
        <Legend color={colors.gold} label="Goles" />
      </View>
    </>
  );
}

function Legend({ color, label }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

// A line from 0% (bottom) to 100% (top), with a dashed guide at 50%.
function WinRateLine({ points }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  const [width, setWidth] = useState(0);
  if (points.length < 2) {
    return <Text style={styles.empty}>Cuando tengas al menos 2 partidos, acá vas a ver tu evolución.</Text>;
  }
  const pad = 6;
  const x = (i) => pad + (i / (points.length - 1)) * (width - pad * 2);
  const y = (rate) => pad + (1 - rate / 100) * (LINE_HEIGHT - pad * 2);
  const last = points[points.length - 1];
  return (
    <>
      <Text style={styles.bigValue}>{last.rate}%</Text>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={LINE_HEIGHT}>
            <Line x1={0} x2={width} y1={y(50)} y2={y(50)} stroke={colors.border} strokeDasharray="4 4" />
            <Polyline
              points={points.map((p, i) => `${x(i)},${y(p.rate)}`).join(' ')}
              fill="none"
              stroke={colors.accent}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <Circle cx={x(points.length - 1)} cy={y(last.rate)} r={5} fill={colors.accent} />
          </Svg>
        ) : null}
      </View>
      <View style={styles.lineAxis}>
        <Text style={styles.axisLabel}>Primer partido</Text>
        <Text style={styles.axisLabel}>La línea punteada es 50%</Text>
        <Text style={styles.axisLabel}>Hoy</Text>
      </View>
    </>
  );
}

// One bar per match; matches without goals recorded show a dash.
function GoalBars({ points }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  if (points.length === 0) return <Text style={styles.empty}>Todavía no cargaste partidos.</Text>;
  const max = Math.max(1, ...points.map((p) => p.goals ?? 0));
  return (
    <View style={styles.barArea}>
      {points.map((point) => (
        <View key={point.id} style={styles.goalColumn}>
          <Text style={styles.barValue}>{point.goals ?? '–'}</Text>
          <View
            style={[
              styles.wideBar,
              { height: Math.max(3, ((point.goals ?? 0) / max) * BAR_AREA) },
              { backgroundColor: point.goals ? colors.gold : colors.border },
            ]}
          />
          <Text style={styles.axisLabel}>{Number(point.date.slice(8))}/{Number(point.date.slice(5, 7))}</Text>
        </View>
      ))}
    </View>
  );
}

// A results bar per format, with matches and win rate.
function FormatRows({ formats }) {
  const styles = useStyles(makeStyles);
  if (formats.length === 0) return <Text style={styles.empty}>Todavía no cargaste partidos.</Text>;
  return formats.map((f) => {
    const counts = { win: f.wins, draw: f.draws, loss: f.losses };
    return (
      <View key={f.format} style={styles.formatRow}>
        <Text style={styles.formatName}>F{f.format}</Text>
        <View style={styles.formatBar}>
          {Object.entries(counts)
            .filter(([, count]) => count > 0)
            .map(([key, count]) => (
              <View key={key} style={{ flex: count, backgroundColor: RESULTS[key].color }} />
            ))}
        </View>
        <Text style={styles.formatInfo}>
          {f.played} PJ · {f.winRate}%
        </Text>
      </View>
    );
  });
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
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
  cardTitle: { fontSize: 22, fontFamily: FONTS.bold, color: c.text },
  cardSubtitle: { fontSize: 13, color: c.muted, marginBottom: 14 },
  empty: { fontSize: 15, color: c.muted },
  barArea: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  monthColumn: { flex: 1, alignItems: 'center' },
  monthBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: BAR_AREA },
  thinBar: { width: 7, borderRadius: 3 },
  axisLabel: { fontSize: 11, color: c.faint, marginTop: 4 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: c.textSoft },
  bigValue: { fontSize: 36, fontFamily: FONTS.extraBold, color: c.accent, marginBottom: 6 },
  lineAxis: { flexDirection: 'row', justifyContent: 'space-between' },
  goalColumn: { flex: 1, alignItems: 'center' },
  wideBar: { width: '70%', borderRadius: 4 },
  barValue: { fontSize: 13, fontWeight: '700', color: c.textSoft, marginBottom: 3 },
  formatRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  formatName: { width: 36, fontSize: 18, fontFamily: FONTS.extraBold, color: c.text },
  formatBar: { flex: 1, flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 },
  formatInfo: { width: 90, fontSize: 13, color: c.muted, textAlign: 'right' },
});
