import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PlayerCard from './PlayerCard';
import PressableScale from './PressableScale';
import { fetchMyMatches } from './api';
import { better, headToHead } from './compare';
import { isoToDisplay } from './dates';
import { FONTS } from './fonts';
import { goalsText, scoreText } from './matches';
import { RESULTS } from './results';
import { computeStats } from './stats';

const RECENT_MATCHES = 5;

// Loads the friend's confirmed matches and shows their profile.
export default function FriendProfileScreen({ friend, myMatches, onBack, onRemove }) {
  const [friendMatches, setFriendMatches] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyMatches(friend.id, 'confirmed').then(setFriendMatches, () =>
      setError('No pudimos cargar el perfil. Revisá tu conexión.'),
    );
  }, [friend.id]);

  return (
    <FriendProfileView
      friend={friend}
      myMatches={myMatches}
      friendMatches={friendMatches}
      error={error}
      onBack={onBack}
      onRemove={onRemove}
    />
  );
}

export function FriendProfileView({ friend, myMatches, friendMatches, error, onBack, onRemove }) {
  // Removing a friend asks for confirmation first.
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  let content;
  if (error) {
    content = <Text style={styles.error}>{error}</Text>;
  } else if (friendMatches === null) {
    content = (
      <View style={[styles.card, styles.loading]}>
        <ActivityIndicator size="large" color="#1f7a4d" />
      </View>
    );
  } else {
    const h2h = headToHead(myMatches, friendMatches);
    const shared = h2h.together.played + h2h.against.played;
    content = (
      <>
        <PlayerCard
          username={friend.username}
          subtitle={`${shared} ${shared === 1 ? 'partido' : 'partidos'} en común con vos`}
          stats={computeStats(friendMatches)}
        />
        <HeadToHeadCard h2h={h2h} username={friend.username} />
        <CompareCard
          mine={computeStats(myMatches)}
          theirs={computeStats(friendMatches)}
          username={friend.username}
        />
        <RecentCard matches={friendMatches} username={friend.username} />
      </>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <Header title={`@${friend.username}`} subtitle="Perfil de amigo" onBack={onBack} />
      <View style={styles.cards}>
        {content}

        {confirmingRemove ? (
          <View style={styles.card}>
            <Text style={styles.confirmText}>
              ¿Eliminar a @{friend.username} de tus amigos? Van a dejar de ver los partidos del otro.
            </Text>
            <View style={styles.confirmButtons}>
              <PressableScale style={styles.cancelButton} onPress={() => setConfirmingRemove(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </PressableScale>
              <PressableScale
                style={styles.removeConfirmButton}
                onPress={() => onRemove(friend.friendshipId)}
              >
                <Text style={styles.removeConfirmText}>Eliminar</Text>
              </PressableScale>
            </View>
          </View>
        ) : (
          <PressableScale style={styles.removeButton} onPress={() => setConfirmingRemove(true)}>
            <Ionicons name="person-remove-outline" size={20} color="#d64545" />
            <Text style={styles.removeText}>Eliminar amigo</Text>
          </PressableScale>
        )}
      </View>
    </ScrollView>
  );
}

// Matches you both confirmed: against each other, and on the same team.
function HeadToHeadCard({ h2h, username }) {
  const { against, together } = h2h;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Mano a mano</Text>

      {against.played === 0 && together.played === 0 ? (
        <Text style={styles.muted}>
          Todavía no tienen partidos confirmados juntos ni en contra. Cargá uno y sumalo.
        </Text>
      ) : null}

      {against.played > 0 ? (
        <>
          <Text style={styles.sectionLabel}>
            En contra · {against.played} {against.played === 1 ? 'partido' : 'partidos'}
          </Text>
          <View style={styles.versusRow}>
            <VersusNumber value={against.myWins} label="Vos" color={RESULTS.win.color} />
            <VersusNumber value={against.draws} label="Empates" color={RESULTS.draw.color} />
            <VersusNumber value={against.theirWins} label={`@${username}`} color={RESULTS.loss.color} />
          </View>
          <View style={styles.bar}>
            {[
              [against.myWins, RESULTS.win.color],
              [against.draws, RESULTS.draw.color],
              [against.theirWins, RESULTS.loss.color],
            ]
              .filter(([count]) => count > 0)
              .map(([count, color]) => (
                <View key={color} style={{ flex: count, backgroundColor: color }} />
              ))}
          </View>
        </>
      ) : null}

      {together.played > 0 ? (
        <>
          <Text style={styles.sectionLabel}>
            Juntos · {together.played} {together.played === 1 ? 'partido' : 'partidos'} en el mismo equipo
          </Text>
          <View style={styles.togetherRow}>
            <Text style={styles.togetherRate}>
              {Math.round((together.wins / together.played) * 100)}%
            </Text>
            <Text style={styles.togetherText}>
              de victorias juntos{'\n'}
              {together.wins} G · {together.draws} E · {together.losses} P
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

function VersusNumber({ value, label, color }) {
  return (
    <View style={styles.versusItem}>
      <Text style={[styles.versusValue, { color }]}>{value}</Text>
      <Text style={styles.versusLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// Your numbers next to your friend's, with the better one highlighted.
function CompareCard({ mine, theirs, username }) {
  const asNumber = (value) => (value === '–' ? -1 : Number(value));
  const rows = [
    ['Partidos', mine.played, theirs.played],
    ['% victorias', mine.winRate, theirs.winRate, '%'],
    ['Goles', mine.goals, theirs.goals],
    ['Goles x partido', mine.goalsPerMatch, theirs.goalsPerMatch],
    ['Mejor racha', mine.winStreak, theirs.winStreak],
  ];
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Comparación</Text>
      <View style={styles.compareHeader}>
        <Text style={[styles.compareName, styles.compareLeft]}>Vos</Text>
        <Text style={[styles.compareName, styles.compareRight]} numberOfLines={1}>
          @{username}
        </Text>
      </View>
      {rows.map(([label, a, b, suffix = '']) => {
        const winner = better(asNumber(a), asNumber(b));
        return (
          <View key={label} style={styles.compareRow}>
            <Text style={[styles.compareValue, styles.compareLeft, winner === 'me' && styles.winner]}>
              {a}
              {suffix}
            </Text>
            <Text style={styles.compareLabel}>{label}</Text>
            <Text style={[styles.compareValue, styles.compareRight, winner === 'them' && styles.winner]}>
              {b}
              {suffix}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function RecentCard({ matches, username }) {
  const recent = [...matches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, RECENT_MATCHES);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Últimos partidos</Text>
      {recent.length === 0 ? (
        <Text style={styles.muted}>@{username} todavía no cargó partidos.</Text>
      ) : (
        recent.map((match) => {
          const result = RESULTS[match.result];
          return (
            <View key={match.id} style={styles.matchRow}>
              <View style={[styles.badge, { backgroundColor: result.color }]}>
                <Text style={styles.badgeText}>{result.short}</Text>
              </View>
              <View style={styles.matchInfo}>
                <Text style={styles.matchTitle} numberOfLines={1}>
                  {match.group ?? `Fútbol ${match.format}`}
                </Text>
                <Text style={styles.matchDetails} numberOfLines={1}>
                  {scoreText(match)} · {isoToDisplay(match.date)}
                </Text>
              </View>
              <Text style={styles.matchGoals}>{match.goals === null ? '–' : goalsText(match.goals)}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  loading: { paddingVertical: 48, alignItems: 'center' },
  error: { color: '#d64545', fontSize: 15, textAlign: 'center', marginTop: 48 },
  cardTitle: { fontSize: 24, fontFamily: FONTS.bold, marginBottom: 6 },
  muted: { color: '#666', fontSize: 15, marginTop: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#666', marginTop: 12, marginBottom: 8 },
  versusRow: { flexDirection: 'row' },
  versusItem: { flex: 1, alignItems: 'center' },
  versusValue: { fontSize: 48, fontFamily: FONTS.extraBold, lineHeight: 52 },
  versusLabel: { fontSize: 14, color: '#444', fontWeight: '600', maxWidth: '90%' },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    gap: 3,
    marginTop: 12,
  },
  togetherRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  togetherRate: { fontSize: 48, fontFamily: FONTS.extraBold, color: '#1f7a4d', lineHeight: 52 },
  togetherText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 21 },
  compareHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  compareName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1f7a4d' },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#eef0f2',
  },
  compareLeft: { textAlign: 'left' },
  compareRight: { textAlign: 'right' },
  compareValue: { flex: 1, fontSize: 24, fontFamily: FONTS.bold, color: '#8a8f98' },
  winner: { color: '#1f7a4d', fontFamily: FONTS.extraBold },
  compareLabel: { flex: 1.3, fontSize: 14, color: '#444', textAlign: 'center' },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eef0f2',
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { color: '#fff', fontFamily: FONTS.extraBold, fontSize: 20 },
  matchInfo: { flex: 1, marginRight: 8 },
  matchTitle: { fontSize: 16, fontWeight: '700' },
  matchDetails: { fontSize: 13, color: '#666', marginTop: 2 },
  matchGoals: { fontSize: 14, fontWeight: '700', color: '#1f7a4d' },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d64545',
    backgroundColor: '#fff',
  },
  removeText: { color: '#d64545', fontSize: 16, fontWeight: '700' },
  confirmText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  confirmButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#eef0f2',
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '600', color: '#333' },
  removeConfirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#d64545',
    alignItems: 'center',
  },
  removeConfirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
