import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Header from './Header';
import PlayerCard from './PlayerCard';
import PressableScale from './PressableScale';
import { uploadAvatar } from './api';
import { FONTS } from './fonts';
import { pickSquarePhoto } from './photo';
import { loadFunnyReminders, saveFunnyReminders } from './settings';
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
  onRemindersChange,
  onSignOut,
}) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  const { mode, setMode } = useTheme();
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
          stats={stats}
          onAvatarPress={changePhoto}
          uploading={uploading}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

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
              trackColor={{ true: colors.win, false: colors.border }}
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
        </View>

        <PressableScale style={styles.signOutButton} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </PressableScale>
      </View>
    </ScrollView>
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
