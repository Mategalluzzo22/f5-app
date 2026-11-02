import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PlayerCard from './PlayerCard';
import PressableScale from './PressableScale';
import { uploadAvatar } from './api';
import { pickSquarePhoto } from './photo';

export default function ProfileScreen({ profile, email, stats, onAvatarChange, onSignOut }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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
