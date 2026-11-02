import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { isoToDisplay } from './dates';
import { FONTS } from './fonts';
import { goalsLimitText, goalsText, maxGoals, scoreText } from './matches';
import { RESULTS } from './results';
import { useColors, useStyles } from './theme';

export default function HistoryScreen({ matches, pending, onSelect, onConfirm, onLeave }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  // Newest first.
  const sortedMatches = [...matches].sort((a, b) => b.date.localeCompare(a.date));
  const count = `${matches.length} ${matches.length === 1 ? 'partido' : 'partidos'}`;

  return (
    <View style={styles.screen}>
      <Header
        title="Partidos"
        subtitle={pending.length > 0 ? `${count} · ${pending.length} para confirmar` : count}
      />
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={sortedMatches}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={
          pending.length > 0 ? (
            <>
              {pending.map((match) => (
                <PendingCard key={match.id} match={match} onConfirm={onConfirm} onLeave={onLeave} />
              ))}
              <Text style={styles.sectionTitle}>Tus partidos</Text>
            </>
          ) : null
        }
        ListEmptyComponent={
          <View style={[styles.card, styles.emptyCard]}>
            <Ionicons name="football" size={36} color={colors.accent} />
            <Text style={styles.emptyText}>Todavía no cargaste partidos.</Text>
          </View>
        }
        renderItem={({ item }) => <MatchRow match={item} onPress={() => onSelect(item.id)} />}
      />
    </View>
  );
}

// Second line of a match: score, date and format.
function matchDetails(match) {
  return `${scoreText(match)} · ${isoToDisplay(match.date)} · F${match.format}`;
}

function MatchRow({ match, onPress }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  const result = RESULTS[match.result];
  return (
    <PressableScale style={[styles.card, styles.matchRow]} onPress={onPress}>
      <View style={[styles.badge, { backgroundColor: result.color }]}>
        <Text style={styles.badgeText}>{result.short}</Text>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {match.group ?? `Fútbol ${match.format}`}
        </Text>
        <Text style={styles.details} numberOfLines={1}>
          {matchDetails(match)}
        </Text>
      </View>
      <Text style={styles.matchGoals}>{match.goals === null ? '–' : goalsText(match.goals)}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} style={styles.chevron} />
    </PressableScale>
  );
}

// A match a friend added you to: confirm you played (and your goals) or say you didn't.
function PendingCard({ match, onConfirm, onLeave }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  const [goals, setGoals] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');
  const creator = match.players.find((p) => p.user_id === match.createdBy);
  const result = RESULTS[match.result];
  const limit = maxGoals(match);

  async function run(action) {
    setBusy(true);
    try {
      await action();
    } catch {
      setBusy(false);
    }
  }

  // You can't score more goals than your team did.
  function changeGoals(value) {
    if (value > limit) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setHint(goalsLimitText(limit));
      return;
    }
    Haptics.selectionAsync();
    setHint('');
    setGoals(Math.max(0, value));
  }

  return (
    <View style={[styles.card, styles.pendingCard]}>
      <View style={styles.pendingTop}>
        <View style={styles.pendingTag}>
          <Ionicons name="time-outline" size={14} color={colors.accent} />
          <Text style={styles.pendingTagText}>Para confirmar</Text>
        </View>
        <Text style={styles.pendingFrom} numberOfLines={1}>
          @{creator?.profile.username} te sumó
        </Text>
      </View>

      <View style={styles.pendingScoreRow}>
        <Text style={styles.pendingScore}>{scoreText(match)}</Text>
        <View style={[styles.resultChip, { backgroundColor: result.color }]}>
          <Text style={styles.resultChipText}>{result.label}</Text>
        </View>
      </View>
      <Text style={styles.details}>
        {[match.group, isoToDisplay(match.date), `F${match.format}`].filter(Boolean).join(' · ')}
      </Text>

      <View style={styles.divider} />

      <View style={styles.pendingGoals}>
        <Text style={styles.pendingLabel}>¿Cuántos goles hiciste?</Text>
        <PressableScale style={styles.stepButton} onPress={() => changeGoals(goals - 1)}>
          <Text style={styles.stepText}>−</Text>
        </PressableScale>
        <Text style={styles.stepValue}>{goals}</Text>
        <PressableScale style={styles.stepButton} onPress={() => changeGoals(goals + 1)}>
          <Text style={styles.stepText}>+</Text>
        </PressableScale>
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <View style={styles.pendingButtons}>
        <PressableScale
          style={[styles.leaveButton, busy && styles.busy]}
          disabled={busy}
          onPress={() => run(() => onLeave(match.id))}
        >
          <Text style={styles.leaveText}>No jugué</Text>
        </PressableScale>
        <PressableScale
          style={[styles.confirmButton, busy && styles.busy]}
          disabled={busy}
          onPress={() => run(() => onConfirm(match.id, goals))}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.confirmText}>Confirmar</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1 },
  list: { marginTop: -32 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  emptyCard: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { color: c.muted, fontSize: 15 },
  sectionTitle: { fontSize: 24, fontFamily: FONTS.bold, marginTop: 10, marginBottom: 10, color: c.text },
  matchRow: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { color: c.onPrimary, fontFamily: FONTS.extraBold, fontSize: 22 },
  matchInfo: { flex: 1, marginRight: 8 },
  title: { fontSize: 17, fontWeight: '700', color: c.text },
  details: { fontSize: 14, color: c.muted, marginTop: 3 },
  matchGoals: { fontSize: 15, fontWeight: '700', color: c.accent },
  chevron: { marginLeft: 6 },
  pendingCard: { padding: 18, borderWidth: 2, borderColor: c.tintBorder },
  pendingTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.tint,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pendingTagText: { fontSize: 13, fontWeight: '700', color: c.accent },
  pendingFrom: { flex: 1, fontSize: 14, color: c.textSoft, fontWeight: '600' },
  pendingScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  pendingScore: { fontSize: 48, fontFamily: FONTS.extraBold, lineHeight: 52, color: c.text },
  resultChip: { borderRadius: 14, paddingVertical: 5, paddingHorizontal: 12 },
  resultChipText: { color: c.onPrimary, fontSize: 15, fontWeight: '700' },
  divider: { height: 1, backgroundColor: c.divider, marginVertical: 14 },
  pendingGoals: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pendingLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: c.text },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 22, color: c.accent, fontWeight: '600' },
  stepValue: { fontSize: 32, fontFamily: FONTS.extraBold, minWidth: 30, textAlign: 'center', color: c.text },
  hint: { color: c.warning, fontSize: 14, marginTop: 8 },
  pendingButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  leaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: c.neutral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveText: { fontSize: 16, fontWeight: '600', color: c.textSoft },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { fontSize: 16, fontWeight: '700', color: c.onPrimary },
  busy: { opacity: 0.6 },
});
