import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Header from './Header';
import PlayerCard from './PlayerCard';
import PlayerInfoForm from './PlayerInfoForm';
import ProBadge from './ProBadge';
import PressableScale from './PressableScale';
import { uploadAvatar } from './api';
import { todayISO } from './dates';
import { FONTS } from './fonts';
import { GOAL_STEP, goalsForYear } from './goals';
import { pickSquarePhoto } from './photo';
import { cardLabels } from './playerInfo';
import { TEAM_COLORS } from './teamColors';
import { loadFunnyReminders, loadYearGoals, saveFunnyReminders, saveYearGoals } from './settings';
import { useColors, useStyles, useTheme } from './theme';

const THEME_MODES = [
  ['auto', 'Automático', 'phone-portrait-outline'],
  ['light', 'Claro', 'sunny-outline'],
  ['dark', 'Oscuro', 'moon-outline'],
];

export default function ProfileScreen({
  profile,
  email,
  stats,
  onAvatarChange,
  onProfileChange,
  onRemindersChange,
  onSignOut,
}) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  const { mode, setMode, teamColor, setTeamColor } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  // null until the saved preference is loaded.
  const [funnyReminders, setFunnyReminders] = useState(null);

  useEffect(() => {
    loadFunnyReminders().then(setFunnyReminders);
  }, []);

  async function toggleFunnyReminders(enabled) {
    Haptics.selectionAsync();
    setFunnyReminders(enabled);
    await saveFunnyReminders(enabled);
    onRemindersChange();
  }

  async function changePhoto() {
    setError('');
    let fileUri;
    try {
      fileUri = await pickSquarePhoto();
    } catch (e) {
      if (__DEV__) console.warn('[photo] picking failed:', e?.message ?? e);
      setError('No pudimos abrir la foto. Probá con otra.');
      return;
    }
    if (__DEV__) console.log('[photo] picked:', fileUri);
    if (!fileUri) return;
    setUploading(true);
    try {
      onAvatarChange(await uploadAvatar(profile.id, fileUri));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      if (__DEV__) console.warn('[photo] upload failed:', e.message);
      setError('No se pudo subir la foto. Revisá tu conexión e intentá de nuevo.');
    }
    setUploading(false);
  }

  return (
    <ScrollView style={styles.screen}>
      <Header title="Perfil" subtitle="Tu cuenta en Doparti" />
      <View style={styles.cards}>
        <PlayerCard
          username={profile.username}
          avatarUrl={profile.avatar_url}
          subtitle={email}
          info={cardLabels(profile)}
          stats={stats}
          onAvatarPress={changePhoto}
          uploading={uploading}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PlayerInfoForm profile={profile} onSaved={onProfileChange} />

        <GoalsCard />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notificaciones</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons name="happy-outline" size={22} color={colors.accent} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Mantenerte conectado a la app</Text>
              <Text style={styles.settingHelp}>
                Te avisamos si un amigo te suma a un partido y te hacemos acordar de anotar tus partidos.
              </Text>
            </View>
            <Switch
              value={funnyReminders ?? true}
              onValueChange={toggleFunnyReminders}
              disabled={funnyReminders === null}
              trackColor={{ true: colors.bright, false: colors.border }}
            />
          </View>
          {funnyReminders === false ? (
            <Text style={styles.settingNote}>
              Apagado: solo te avisamos cuando un amigo te suma a un partido.
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apariencia</Text>
          <View style={styles.modeRow}>
            {THEME_MODES.map(([value, label, icon]) => {
              const selected = mode === value;
              return (
                <PressableScale
                  key={value}
                  style={[styles.modeOption, selected && styles.modeSelected]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setMode(value);
                  }}
                >
                  <Ionicons name={icon} size={20} color={selected ? colors.onPrimary : colors.textSoft} />
                  <Text style={[styles.modeText, selected && styles.modeTextSelected]}>{label}</Text>
                </PressableScale>
              );
            })}
          </View>
          {mode === 'auto' ? (
            <Text style={styles.modeHelp}>Automático usa el mismo modo que tu celular.</Text>
          ) : null}

          <View style={[styles.titleRow, styles.teamTitle]}>
            <Text style={styles.settingLabel}>Color de tu equipo</Text>
            <ProBadge />
          </View>
          <View style={styles.teamRow}>
            {TEAM_COLORS.map((team) => {
              const selected = teamColor === team.id;
              return (
                <PressableScale
                  key={team.id}
                  style={[styles.teamSwatch, { backgroundColor: team.color }, selected && styles.teamSelected]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTeamColor(team.id);
                  }}
                  accessibilityLabel={team.name}
                >
                  {selected ? <Ionicons name="checkmark" size={20} color="#ffffff" /> : null}
                </PressableScale>
              );
            })}
          </View>
        </View>

        <PressableScale style={styles.signOutButton} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

// Pro: pick this year's goals (goals and/or matches). Saved on the phone.
function GoalsCard() {
  const styles = useStyles(makeStyles);
  const year = todayISO().slice(0, 4);
  // null until the saved goals are loaded.
  const [targets, setTargets] = useState(null);
  const changed = useRef(false);

  useEffect(() => {
    loadYearGoals().then((saved) => setTargets(goalsForYear(saved, year)));
  }, [year]);

  // Save after each change (not on the first load).
  useEffect(() => {
    if (changed.current) saveYearGoals({ year, ...targets });
  }, [targets, year]);

  // Builds on the latest value, so quick repeated taps all count.
  function change(kind, delta) {
    Haptics.selectionAsync();
    changed.current = true;
    setTargets((current) => ({ ...current, [kind]: Math.max(0, current[kind] + delta) }));
  }

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={[styles.cardTitle, styles.inlineTitle]}>Tus metas {year}</Text>
        <ProBadge />
      </View>
      <Text style={styles.goalsHelp}>Ponete un objetivo y seguí tu progreso en Inicio.</Text>
      {targets ? (
        <>
          <GoalStepper label="Goles" value={targets.goals} onChange={(d) => change('goals', d)} />
          <GoalStepper label="Partidos" value={targets.matches} onChange={(d) => change('matches', d)} />
        </>
      ) : null}
    </View>
  );
}

function GoalStepper({ label, value, onChange }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.goalRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.goalStepper}>
        <PressableScale
          style={[styles.stepButton, value === 0 && styles.stepDisabled]}
          onPress={() => onChange(-GOAL_STEP)}
          disabled={value === 0}
          accessibilityLabel={`Menos ${label.toLowerCase()}`}
        >
          <Text style={styles.stepText}>−</Text>
        </PressableScale>
        <Text style={styles.goalValue}>{value === 0 ? 'Sin meta' : value}</Text>
        <PressableScale
          style={styles.stepButton}
          onPress={() => onChange(GOAL_STEP)}
          accessibilityLabel={`Más ${label.toLowerCase()}`}
        >
          <Text style={styles.stepText}>+</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
  error: { color: c.danger, fontSize: 15, textAlign: 'center' },
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
  cardTitle: { fontSize: 24, fontFamily: FONTS.bold, marginBottom: 10, color: c.text },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  inlineTitle: { marginBottom: 0 },
  goalsHelp: { fontSize: 13, color: c.muted, marginBottom: 8 },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  goalStepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: { opacity: 0.4 },
  stepText: { fontSize: 22, color: c.accent, fontWeight: '600' },
  goalValue: { minWidth: 76, textAlign: 'center', fontSize: 22, fontFamily: FONTS.extraBold, color: c.text },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '700', color: c.text },
  settingHelp: { fontSize: 13, color: c.muted, marginTop: 2 },
  settingNote: {
    fontSize: 13,
    color: c.muted,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.divider,
  },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeOption: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: c.border,
  },
  modeSelected: { backgroundColor: c.primary, borderColor: c.primary },
  modeText: { fontSize: 14, fontWeight: '700', color: c.textSoft },
  modeTextSelected: { color: c.onPrimary },
  modeHelp: { fontSize: 13, color: c.muted, marginTop: 10 },
  teamTitle: { marginTop: 18, marginBottom: 10 },
  teamRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  teamSwatch: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  teamSelected: { borderWidth: 3, borderColor: c.text },
  signOutButton: {
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
  signOutText: { color: c.danger, fontSize: 16, fontWeight: '700' },
});
