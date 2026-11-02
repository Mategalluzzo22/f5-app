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

export default function ProfileScreen({
  profile,
  email,
  stats,
  onAvatarChange,
  onRemindersChange,
  onSignOut,
}) {
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
              <Ionicons name="happy-outline" size={22} color="#1f7a4d" />
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
              trackColor={{ true: '#1f9d55', false: '#d0d4da' }}
            />
          </View>
          {funnyReminders === false ? (
            <Text style={styles.settingNote}>
              Apagado: solo te avisamos cuando un amigo te suma a un partido.
            </Text>
          ) : null}
        </View>

        <PressableScale style={styles.signOutButton} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#d64545" />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
  error: { color: '#d64545', fontSize: 15, textAlign: 'center' },
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
  cardTitle: { fontSize: 24, fontFamily: FONTS.bold, marginBottom: 10 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e8f3ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '700' },
  settingHelp: { fontSize: 13, color: '#666', marginTop: 2 },
  settingNote: {
    fontSize: 13,
    color: '#666',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eef0f2',
  },
  signOutButton: {
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
  signOutText: { color: '#d64545', fontSize: 16, fontWeight: '700' },
});
