import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { isoToLongDisplay } from './dates';
import { FONTS } from './fonts';
import { scoreText } from './matches';
import { RESULTS } from './results';
import { useColors, useStyles } from './theme';

export default function MatchDetailScreen({ match, myId, onBack, onDelete, onLeave }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  // Deleting or leaving asks for confirmation first, so a stray tap can't lose a match.
  const [confirming, setConfirming] = useState(false);
  const result = RESULTS[match.result];
  const isCreator = match.createdBy === myId;
  const myTeam = match.players.filter((p) => p.team === match.team);
  const rivals = match.players.filter((p) => p.team !== match.team);

  return (
    <View style={styles.screen}>
      <Header
        title={scoreText(match)}
        subtitle={match.group ? `${match.group} · Fútbol ${match.format}` : `Fútbol ${match.format}`}
        onBack={onBack}
      />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={[styles.card, styles.resultCard]}>
          <View style={[styles.resultBadge, { backgroundColor: result.color }]}>
            <Text style={styles.resultBadgeText}>{result.short}</Text>
          </View>
          <Text style={[styles.resultLabel, { color: result.color }]}>{result.label}</Text>
        </View>

        <View style={[styles.card, styles.goalsCard]}>
          <Ionicons name="football" size={28} color={colors.accent} />
          <Text style={styles.goalsNumber}>{match.goals === null ? '–' : match.goals}</Text>
          <Text style={styles.cardLabel}>
            {match.goals === null ? 'Goles sin dato' : match.goals === 1 ? 'Tu gol' : 'Tus goles'}
          </Text>
        </View>

        <View style={[styles.card, styles.dateCard]}>
          <Ionicons name="calendar" size={24} color={colors.accent} />
          <Text style={styles.dateText}>{isoToLongDisplay(match.date)}</Text>
        </View>

        {match.players.length > 1 ? (
          <View style={styles.card}>
            <TeamList title="Tu equipo" players={myTeam} myId={myId} />
            {rivals.length > 0 ? <TeamList title="Rival" players={rivals} myId={myId} /> : null}
          </View>
        ) : null}

        {confirming ? (
          <View style={[styles.card, styles.confirmCard]}>
            <Text style={styles.confirmText}>
              {isCreator
                ? '¿Seguro que querés eliminar este partido? Se borra para todos los jugadores.'
                : '¿No jugaste este partido? Vas a salir y no va a contar en tus estadísticas.'}
            </Text>
            <View style={styles.confirmButtons}>
              <PressableScale style={styles.cancelButton} onPress={() => setConfirming(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </PressableScale>
              <PressableScale
                style={styles.confirmDeleteButton}
                onPress={() => (isCreator ? onDelete(match.id) : onLeave(match.id))}
              >
                <Text style={styles.confirmDeleteText}>{isCreator ? 'Eliminar' : 'Salir'}</Text>
              </PressableScale>
            </View>
          </View>
        ) : (
          <PressableScale style={styles.deleteButton} onPress={() => setConfirming(true)}>
            <Ionicons name={isCreator ? 'trash-outline' : 'exit-outline'} size={20} color={colors.danger} />
            <Text style={styles.deleteText}>{isCreator ? 'Eliminar partido' : 'No jugué este partido'}</Text>
          </PressableScale>
        )}
      </ScrollView>
    </View>
  );
}

function TeamList({ title, players, myId }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.team}>
      <Text style={styles.teamTitle}>{title}</Text>
      {players.map((player) => (
        <View key={player.user_id} style={styles.playerRow}>
          <Text style={styles.playerName}>
            @{player.profile.username}
            {player.user_id === myId ? ' (vos)' : ''}
          </Text>
          {player.status === 'pending' ? (
            <Text style={styles.pendingText}>Pendiente</Text>
          ) : player.goals !== null ? (
            <Text style={styles.playerGoals}>
              {player.goals} {player.goals === 1 ? 'gol' : 'goles'}
            </Text>
          ) : (
            <Ionicons name="checkmark-circle" size={18} color="#1f9d55" />
          )}
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1 },
  content: { marginTop: -32 },
  contentInner: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  resultCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  resultBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeText: { color: c.onPrimary, fontSize: 34, fontFamily: FONTS.extraBold },
  resultLabel: { fontSize: 40, fontFamily: FONTS.extraBold, color: c.text },
  goalsCard: { alignItems: 'center', paddingVertical: 28 },
  goalsNumber: { fontSize: 88, fontFamily: FONTS.extraBold, lineHeight: 94, marginTop: 4, color: c.text },
  cardLabel: { fontSize: 15, color: c.muted },
  dateCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateText: { fontSize: 17, fontWeight: '600', flex: 1, color: c.text },
  team: { marginBottom: 8 },
  teamTitle: { fontSize: 22, fontFamily: FONTS.bold, marginBottom: 4, color: c.text },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  playerName: { flex: 1, fontSize: 15, fontWeight: '600', color: c.text },
  playerGoals: { fontSize: 14, fontWeight: '600', color: c.accent },
  pendingText: { fontSize: 13, fontWeight: '600', color: c.faint },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: c.danger,
  },
  deleteText: { color: c.danger, fontSize: 16, fontWeight: '700' },
  confirmCard: { marginTop: 12 },
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
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: c.danger,
    alignItems: 'center',
  },
  confirmDeleteText: { fontSize: 16, fontWeight: '700', color: c.onPrimary },
});
