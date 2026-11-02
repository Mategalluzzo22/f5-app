import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { todayISO } from './dates';
import { FONTS } from './fonts';
import { bestMonths, groupsSentence, monthKey, monthLabel, monthSummary, shiftMonth } from './monthly';
import { RESULTS } from './results';
import { useColors, useStyles } from './theme';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// "Tu mes a mes" (Pro): your best months and a calendar of the days you played.
export default function MonthlyScreen({ matches, onBack }) {
  const styles = useStyles(makeStyles);
  const today = todayISO();
  const current = monthKey(today);
  const first = matches.reduce((min, m) => (monthKey(m.date) < min ? monthKey(m.date) : min), current);
  const [month, setMonth] = useState(current);

  const best = bestMonths(matches);
  const summary = monthSummary(matches, month);
  const sentence = groupsSentence(summary.groups, month);

  return (
    <ScrollView style={styles.screen}>
      <Header title="Tu mes a mes" subtitle="Doparti Pro · Tus partidos, mes por mes" onBack={onBack} />
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tus mejores meses</Text>
          <BestRow
            icon="calendar"
            label="Más partidos"
            month={best.byMatches}
            value={best.byMatches && plural(best.byMatches.played, 'partido', 'partidos')}
          />
          <View style={styles.divider} />
          <BestRow
            icon="football"
            label="Más goles"
            month={best.byGoals}
            value={best.byGoals && plural(best.byGoals.goals, 'gol', 'goles')}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.monthRow}>
            <MonthArrow icon="chevron-back" label="Mes anterior" disabled={month <= first} onPress={() => setMonth(shiftMonth(month, -1))} />
            <Text style={styles.monthTitle}>{capitalize(monthLabel(month))}</Text>
            <MonthArrow icon="chevron-forward" label="Mes siguiente" disabled={month >= current} onPress={() => setMonth(shiftMonth(month, 1))} />
          </View>
          <Calendar month={month} days={summary.days} today={today} />
        </View>

        <View style={styles.card}>
          {summary.played === 0 ? (
            <Text style={styles.muted}>No anotaste partidos en {monthLabel(month).split(' ')[0]}.</Text>
          ) : (
            <>
              <View style={styles.totals}>
                <Total value={summary.played} label={summary.played === 1 ? 'partido' : 'partidos'} />
                <Total value={summary.hasGoals ? summary.goals : '–'} label={summary.goals === 1 ? 'gol' : 'goles'} />
                <Total value={`${summary.wins}-${summary.draws}-${summary.losses}`} label="G - E - P" />
              </View>
              {sentence ? <Text style={styles.sentence}>{sentence}</Text> : null}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function BestRow({ icon, label, month, value }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  return (
    <View style={styles.bestRow}>
      <View style={styles.bestIcon}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <View style={styles.bestInfo}>
        <Text style={styles.bestLabel}>{label}</Text>
        <Text style={styles.bestDetail}>{month ? capitalize(monthLabel(month.key)) : 'Todavía no hay datos'}</Text>
      </View>
      {value ? <Text style={styles.bestValue}>{value}</Text> : null}
    </View>
  );
}

function MonthArrow({ icon, label, disabled, onPress }) {
  const colors = useColors();
  return (
    <PressableScale onPress={onPress} disabled={disabled} hitSlop={10} accessibilityLabel={label}>
      <Ionicons name={icon} size={26} color={disabled ? colors.border : colors.accent} />
    </PressableScale>
  );
}

// A month grid starting on Monday. Days you played are filled with the color
// of that day's result; today has a ring.
function Calendar({ month, days, today }) {
  const styles = useStyles(makeStyles);
  const [year, monthNumber] = month.split('-').map(Number);
  const offset = (new Date(year, monthNumber - 1, 1).getDay() + 6) % 7;
  const total = new Date(year, monthNumber, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const todayDay = monthKey(today) === month ? Number(today.slice(8, 10)) : null;

  return (
    <View style={styles.grid}>
      {WEEKDAYS.map((name, i) => (
        <Text key={`w${i}`} style={[styles.cell, styles.weekday]}>
          {name}
        </Text>
      ))}
      {cells.map((day, i) => {
        const result = day && days[day];
        return (
          <View key={i} style={styles.cell}>
            {day ? (
              <View
                style={[
                  styles.day,
                  result && { backgroundColor: RESULTS[result].color },
                  day === todayDay && styles.today,
                ]}
              >
                <Text style={[styles.dayText, result && styles.dayTextPlayed]}>{day}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function Total({ value, label }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.total}>
      <Text style={styles.totalValue}>{value}</Text>
      <Text style={styles.totalLabel}>{label}</Text>
    </View>
  );
}

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

function capitalize(text) {
  return text[0].toUpperCase() + text.slice(1);
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
  cardTitle: { fontSize: 22, fontFamily: FONTS.bold, marginBottom: 12, color: c.text },
  divider: { height: 1, backgroundColor: c.divider, marginVertical: 12 },
  bestRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bestIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestInfo: { flex: 1 },
  bestLabel: { fontSize: 15, fontWeight: '600', color: c.text },
  bestDetail: { fontSize: 13, color: c.muted, marginTop: 2 },
  bestValue: { fontSize: 22, fontFamily: FONTS.extraBold, color: c.accent },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthTitle: { fontSize: 22, fontFamily: FONTS.bold, color: c.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  weekday: { fontSize: 13, fontWeight: '700', color: c.faint, textAlign: 'center' },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 2, borderColor: c.accent },
  dayText: { fontSize: 15, color: c.textSoft },
  dayTextPlayed: { color: c.onPrimary, fontWeight: '700' },
  muted: { fontSize: 15, color: c.muted, textAlign: 'center' },
  totals: { flexDirection: 'row' },
  total: { flex: 1, alignItems: 'center' },
  totalValue: { fontSize: 32, fontFamily: FONTS.extraBold, color: c.accent },
  totalLabel: { fontSize: 13, color: c.muted },
  sentence: { fontSize: 15, color: c.textSoft, marginTop: 14, lineHeight: 21, textAlign: 'center' },
});
