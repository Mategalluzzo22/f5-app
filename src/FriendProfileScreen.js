import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PlayerCard from './PlayerCard';
import PressableScale from './PressableScale';
import { fetchMyMatches, fetchProfile } from './api';
import { better, headToHead } from './compare';
import { isoToDisplay } from './dates';
import { FONTS } from './fonts';
import { goalsText, scoreText } from './matches';
import { cardLabels } from './playerInfo';
import { RESULTS } from './results';
import { computeStats } from './stats';
import { useColors, useStyles } from './theme';

const RECENT_MATCHES = 5;

// Loads the friend's confirmed matches and player card, and shows their profile.
export default function FriendProfileScreen({ friend, myMatches, onBack, onRemove }) {
  const [friendMatches, setFriendMatches] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyMatches(friend.id, 'confirmed').then(setFriendMatches, () =>
      setError('No pudimos cargar el perfil. Revisá tu conexión.'),
    );
    // Without the player card the rest of the profile still works.
    fetchProfile(friend.id).then(setFriendProfile, () => {});
  }, [friend.id]);

  return (
    <FriendProfileView
      friend={friend}
      myMatches={myMatches}
      friendMatches={friendMatches}
      friendProfile={friendProfile}
      error={error}
      onBack={onBack}
      onRemove={onRemove}
    />
  );
}

export function FriendProfileView({ friend, myMatches, friendMatches, friendProfile = null, error, onBack, onRemove }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  // Removing a friend asks for confirmation first.
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  let content;
  if (error) {
    content = <Text style={styles.error}>{error}</Text>;
  } else if (friendMatches === null) {
    content = (
      <View style={[styles.card, styles.loading]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  } else {
    const h2h = headToHead(myMatches, friendMatches);
    const shared = h2h.together.played + h2h.against.played;
    content = (
      <>
        <PlayerCard
          username={friend.username}
          avatarUrl={friend.avatarUrl}
          subtitle={`${shared} ${shared === 1 ? 'partido' : 'partidos'} en común con vos`}
          info={cardLabels(friendProfile)}
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
            <Ionicons name="person-remove-outline" size={20} color={colors.danger} />
            <Text style={styles.removeText}>Eliminar amigo</Text>
          </PressableScale>
        )}
      </View>
    </ScrollView>
  );
}

// Matches you both confirmed: against each other, and on the same team.
function HeadToHeadCard({ h2h, username }) {
  const styles = useStyles(makeStyles);
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
  const styles = useStyles(makeStyles);
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
  const styles = useStyles(makeStyles);
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
  const styles = useStyles(makeStyles);
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

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  card: {
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  loading: { paddingVertical: 48, alignItems: 'center' },
  error: { color: c.danger, fontSize: 15, textAlign: 'center', marginTop: 48 },
  cardTitle: { fontSize: 24, fontFamily: FONTS.bold, marginBottom: 6, color: c.text },
  muted: { color: c.muted, fontSize: 15, marginTop: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: c.muted, marginTop: 12, marginBottom: 8 },
  versusRow: { flexDirection: 'row' },
  versusItem: { flex: 1, alignItems: 'center' },
  versusValue: { fontSize: 48, fontFamily: FONTS.extraBold, lineHeight: 52, color: c.text },
  versusLabel: { fontSize: 14, color: c.textSoft, fontWeight: '600', maxWidth: '90%' },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    gap: 3,
    marginTop: 12,
  },
  togetherRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  togetherRate: { fontSize: 48, fontFamily: FONTS.extraBold, color: c.accent, lineHeight: 52 },
  togetherText: { flex: 1, fontSize: 15, color: c.textSoft, lineHeight: 21 },
  compareHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  compareName: { flex: 1, fontSize: 15, fontWeight: '700', color: c.accent },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: c.divider,
  },
  compareLeft: { textAlign: 'left' },
  compareRight: { textAlign: 'right' },
  compareValue: { flex: 1, fontSize: 24, fontFamily: FONTS.bold, color: c.faint },
  winner: { color: c.accent, fontFamily: FONTS.extraBold },
  compareLabel: { flex: 1.3, fontSize: 14, color: c.textSoft, textAlign: 'center' },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: c.divider,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { color: c.onPrimary, fontFamily: FONTS.extraBold, fontSize: 20 },
  matchInfo: { flex: 1, marginRight: 8 },
  matchTitle: { fontSize: 16, fontWeight: '700', color: c.text },
  matchDetails: { fontSize: 13, color: c.muted, marginTop: 2 },
  matchGoals: { fontSize: 14, fontWeight: '700', color: c.accent },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: c.danger,
    backgroundColor: c.card,
  },
  removeText: { color: c.danger, fontSize: 16, fontWeight: '700' },
  confirmText: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: c.text },
  confirmButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: c.neutral,
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '600', color: c.textSoft },
  removeConfirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: c.danger,
    alignItems: 'center',
  },
  removeConfirmText: { fontSize: 16, fontWeight: '700', color: c.onPrimary },
});
