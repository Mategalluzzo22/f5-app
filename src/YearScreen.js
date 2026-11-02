import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { isoToDisplay, todayISO } from './dates';
import { FONTS } from './fonts';
import { matchYears, yearSummary } from './insights';
import { scoreText } from './matches';
import { monthLabel } from './monthly';
import { useColors, useStyles } from './theme';

// "Tu año en Doparti" (Pro): the year in review, with arrows to past years.
// proMonths: the months the user paid Pro (see yearSummary); null = all count.
export default function YearScreen({ matches, myId, proMonths = null, onBack }) {
  const styles = useStyles(makeStyles);
  const years = matchYears(matches);
  const [year, setYear] = useState(years[0] ?? todayISO().slice(0, 4));
  const index = years.indexOf(year);
  const summary = yearSummary(matches, year, myId, proMonths);
  const best = summary.bestMatch;

  return (
    <ScrollView style={styles.screen}>
      <Header title="Tu año en Doparti" subtitle="Doparti Pro · El resumen de tu año futbolero" onBack={onBack} />
      <View style={styles.cards}>
        <View style={[styles.card, styles.hero]}>
          <View style={styles.yearRow}>
            <YearArrow icon="chevron-back" label="Año anterior" disabled={index >= years.length - 1} onPress={() => setYear(years[index + 1])} />
            <Text style={styles.year}>{year}</Text>
            <YearArrow icon="chevron-forward" label="Año siguiente" disabled={index <= 0} onPress={() => setYear(years[index - 1])} />
          </View>
          <View style={styles.bigNumbers}>
            <Big value={summary.played} label={summary.played === 1 ? 'partido' : 'partidos'} />
            <Big value={summary.goals} label={summary.goals === 1 ? 'gol' : 'goles'} />
            <Big value={`${summary.winRate}%`} label="victorias" />
          </View>
          {summary.proMonthCount !== null ? (
            <Text style={styles.proNote}>
              Cuentan solo los meses con Doparti Pro ({summary.proMonthCount} de 12).
            </Text>
          ) : null}
          <Text style={styles.record}>
            {plural(summary.wins, 'ganado', 'ganados')} · {plural(summary.draws, 'empatado', 'empatados')} ·{' '}
            {plural(summary.losses, 'perdido', 'perdidos')}
          </Text>
        </View>

        {summary.played > 0 ? (
          <View style={styles.card}>
            <Highlight
              icon="football"
              label="Tu mejor partido"
              value={best ? `${best.goals} ${best.goals === 1 ? 'gol' : 'goles'}` : '–'}
              detail={best ? [scoreText(best), best.group, isoToDisplay(best.date)].filter(Boolean).join(' · ') : 'No cargaste tus goles'}
            />
            <Highlight
              icon="calendar"
              label="El mes que más jugaste"
              value={summary.busiestMonth.played}
              detail={capitalize(monthLabel(summary.busiestMonth.key))}
            />
            {summary.bestMonth ? (
              <Highlight
                icon="flame"
                label="El mes que más goles hiciste"
                value={summary.bestMonth.goals}
                detail={capitalize(monthLabel(summary.bestMonth.key))}
              />
            ) : null}
            {summary.topGroup ? (
              <Highlight
                icon="people"
                label="Tu grupo del año"
                value={summary.topGroup.played}
                detail={`${summary.topGroup.name} · ${summary.topGroup.winRate}% de victorias`}
              />
            ) : null}
            {summary.topFriend ? (
              <Highlight
                icon="person"
                label="Con quien más compartiste cancha"
                value={summary.topFriend.played}
                detail={`@${summary.topFriend.username}`}
              />
            ) : null}
            <Highlight icon="trophy" label="Tu mejor racha ganando" value={summary.winStreak} detail={summary.winStreak === 1 ? 'partido seguido' : 'partidos seguidos'} last />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.muted}>Todavía no cargaste partidos este año.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function YearArrow({ icon, label, disabled, onPress }) {
  const colors = useColors();
  return (
    <PressableScale onPress={onPress} disabled={disabled} hitSlop={10} accessibilityLabel={label}>
      <Ionicons name={icon} size={28} color={disabled ? colors.border : colors.accent} />
    </PressableScale>
  );
}

function Big({ value, label }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.big}>
      <Text style={styles.bigValue}>{value}</Text>
      <Text style={styles.bigLabel}>{label}</Text>
    </View>
  );
}

function Highlight({ icon, label, value, detail, last = false }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  return (
    <View style={[styles.highlight, !last && styles.highlightBorder]}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
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
  hero: { alignItems: 'stretch' },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  year: { fontSize: 44, fontFamily: FONTS.extraBold, color: c.text },
  bigNumbers: { flexDirection: 'row', marginTop: 12 },
  big: { flex: 1, alignItems: 'center' },
  bigValue: { fontSize: 40, fontFamily: FONTS.extraBold, color: c.accent, lineHeight: 44 },
  bigLabel: { fontSize: 13, color: c.muted },
  record: { fontSize: 13, color: c.muted, textAlign: 'center', marginTop: 12 },
  proNote: { fontSize: 13, color: c.warning, textAlign: 'center', marginTop: 12 },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  highlightBorder: { borderBottomWidth: 1, borderBottomColor: c.divider },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600', color: c.text },
  detail: { fontSize: 13, color: c.muted, marginTop: 2 },
  value: { fontSize: 28, fontFamily: FONTS.extraBold, color: c.accent },
  muted: { fontSize: 15, color: c.muted, textAlign: 'center' },
});
