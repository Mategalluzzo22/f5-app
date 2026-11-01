import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { isoToDisplay } from './dates';
import { FONTS } from './fonts';
import { goalsText, scoreText } from './matches';
import { RESULTS } from './results';

export default function HistoryScreen({ matches, pending, onSelect, onConfirm, onLeave }) {
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
        ListHeaderComponent={
          pending.length > 0 ? (
            <View style={styles.pendingSection}>
              <Text style={styles.sectionTitle}>Para confirmar</Text>
              {pending.map((match) => (
                <PendingCard key={match.id} match={match} onConfirm={onConfirm} onLeave={onLeave} />
              ))}
              <Text style={styles.sectionTitle}>Tus partidos</Text>
            </View>
          ) : null
        }
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

function matchTitle(match) {
  return match.group ? `${scoreText(match)} · ${match.group}` : scoreText(match);
}

function MatchRow({ match, onPress }) {
  const result = RESULTS[match.result];
  return (
    <PressableScale style={styles.matchRow} onPress={onPress}>
      <View style={[styles.badge, { backgroundColor: result.color }]}>
        <Text style={styles.badgeText}>{result.short}</Text>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.title}>{matchTitle(match)}</Text>
        <Text style={styles.date}>
          {isoToDisplay(match.date)} · F{match.format}
        </Text>
      </View>
      <Text style={styles.matchGoals}>{match.goals === null ? '–' : goalsText(match.goals)}</Text>
      <Ionicons name="chevron-forward" size={18} color="#b0b5bc" style={styles.chevron} />
    </PressableScale>
  );
}

// A match a friend added you to: confirm you played (and your goals) or say you didn't.
function PendingCard({ match, onConfirm, onLeave }) {
  const [goals, setGoals] = useState(0);
  const [busy, setBusy] = useState(false);
  const creator = match.players.find((p) => p.user_id === match.createdBy);

  async function run(action) {
    setBusy(true);
    try {
      await action();
    } catch {
      setBusy(false);
    }
  }

  function changeGoals(value) {
    Haptics.selectionAsync();
    setGoals(Math.max(0, value));
  }

  return (
    <View style={styles.pendingCard}>
      <Text style={styles.pendingFrom}>@{creator?.profile.username} te sumó a un partido</Text>
      <Text style={styles.title}>{matchTitle(match)}</Text>
      <Text style={styles.date}>
        {isoToDisplay(match.date)} · F{match.format} · {RESULTS[match.result].label}
      </Text>

      <View style={styles.pendingGoals}>
        <Text style={styles.pendingLabel}>Tus goles</Text>
        <PressableScale style={styles.stepButton} onPress={() => changeGoals(goals - 1)}>
          <Text style={styles.stepText}>−</Text>
        </PressableScale>
        <Text style={styles.stepValue}>{goals}</Text>
        <PressableScale style={styles.stepButton} onPress={() => changeGoals(goals + 1)}>
          <Text style={styles.stepText}>+</Text>
        </PressableScale>
      </View>

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
          <Text style={styles.confirmText}>Confirmar</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const card = {
  backgroundColor: '#fff',
  borderRadius: 14,
  padding: 14,
  marginBottom: 8,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { marginTop: -32 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { color: '#666', fontSize: 15, flex: 1, textAlign: 'center' },
  pendingSection: { gap: 0 },
  sectionTitle: { fontSize: 22, fontFamily: FONTS.bold, marginTop: 8, marginBottom: 8 },
  matchRow: { ...card, flexDirection: 'row', alignItems: 'center' },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { color: '#fff', fontFamily: FONTS.extraBold, fontSize: 20 },
  matchInfo: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 13, color: '#666', marginTop: 2 },
  matchGoals: { fontSize: 15, fontWeight: '600', color: '#1f7a4d' },
  chevron: { marginLeft: 6 },
  pendingCard: { ...card, borderWidth: 2, borderColor: '#d4eedf' },
  pendingFrom: { fontSize: 13, color: '#1f7a4d', fontWeight: '700', marginBottom: 6 },
  pendingGoals: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  pendingLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#444' },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f3ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 20, color: '#1f7a4d', fontWeight: '600' },
  stepValue: { fontSize: 28, fontFamily: FONTS.extraBold, minWidth: 28, textAlign: 'center' },
  pendingButtons: { flexDirection: 'row', gap: 10, marginTop: 14 },
  leaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#eef0f2',
    alignItems: 'center',
  },
  leaveText: { fontSize: 15, fontWeight: '600', color: '#333' },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1f7a4d',
    alignItems: 'center',
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  busy: { opacity: 0.6 },
});
