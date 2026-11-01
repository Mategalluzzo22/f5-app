import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PitchBackground from './PitchBackground';
import PressableScale from './PressableScale';
import { FONTS } from './fonts';
import { signInWithGoogle } from './googleAuth';

const FEATURES = [
  ['football', 'Anotá cada partido que jugás'],
  ['stats-chart', 'Llevá tus números y tus récords'],
  ['people', 'Compartilos con tus amigos'],
];

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
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <PitchBackground centered />

      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="football" size={56} color="#1f7a4d" />
        </View>
        <Text style={styles.title}>Doparti</Text>
        <Text style={styles.tagline}>Tu historial futbolístico</Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map(([icon, text]) => (
          <View key={icon} style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name={icon} size={20} color="#fff" />
            </View>
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}
      </View>

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
  hero: { alignItems: 'center', marginTop: 32 },
  logo: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  title: { color: '#fff', fontSize: 64, fontFamily: FONTS.extraBold, marginTop: 16, lineHeight: 70 },
  tagline: { color: '#cfeedd', fontSize: 18 },
  features: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { color: '#fff', fontSize: 17, fontWeight: '600', flex: 1 },
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
