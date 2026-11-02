import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoginTour from './LoginTour';
import PitchBackground from './PitchBackground';
import PressableScale from './PressableScale';
import { FONTS } from './fonts';
import { signInWithGoogle } from './googleAuth';

const LOGO = require('../assets/splash-icon.png');

// Login with Google only: Google already proves the account is yours, so there
// are no codes or passwords to handle. "Continue with Apple" joins when publishing.
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loginWithGoogle() {
    setError('');
    setLoading(true);
    try {
      // On success App hears about the new session and moves on by itself.
      await signInWithGoogle();
    } catch (e) {
      if (__DEV__) console.warn('[login] Google login failed:', e.message);
      setError('No pudimos entrar con Google. Probá de nuevo.');
    }
    setLoading(false);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <PitchBackground centered />

      <View style={styles.hero}>
        <Image source={LOGO} style={styles.logo} accessibilityLabel="Logo de Doparti" />
        <View>
          <Text style={styles.title}>Doparti</Text>
          <Text style={styles.tagline}>Tu historial futbolístico</Text>
        </View>
      </View>

      {/* A preview of the app before signing in. */}
      <LoginTour />

      <View>
        <PressableScale
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={loginWithGoogle}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#222" />
          <Text style={styles.googleText}>{loading ? 'Un momento…' : 'Continuar con Google'}</Text>
        </PressableScale>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1f7a4d',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  // Logo and name side by side, small, so the tour gets the room.
  hero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  // The splash image is the white logo tile with transparent space around it
  // (the tile is 600 of its 1024px); the negative margin trims that space.
  logo: { width: 100, height: 100, margin: -21 },
  title: { color: '#fff', fontSize: 44, fontFamily: FONTS.extraBold, lineHeight: 50 },
  tagline: { color: '#cfeedd', fontSize: 15, marginTop: -4 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  googleText: { fontSize: 17, fontWeight: '700', color: '#222' },
  error: { color: '#ffd5d5', marginTop: 12, fontSize: 15, textAlign: 'center' },
});
