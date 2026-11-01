import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { signInWithGoogle } from './googleAuth';

// Login with Google only: Google already proves the account is yours, so there
// are no codes or passwords to handle. "Continue with Apple" joins when publishing.
export default function LoginScreen() {
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
    <ScrollView style={styles.screen}>
      <Header title="Doparti ⚽" subtitle="Tu historial futbolístico" />
      <View style={styles.card}>
        <Text style={styles.text}>
          Registrá cada partido que jugás, llevá tus números y compartilos con tus amigos.
        </Text>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  card: {
    marginTop: -32,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  text: { fontSize: 16, color: '#444', lineHeight: 22, marginBottom: 20 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#d0d4da',
    borderRadius: 12,
    paddingVertical: 14,
  },
  buttonDisabled: { opacity: 0.6 },
  googleText: { fontSize: 16, fontWeight: '700', color: '#222' },
  error: { color: '#d64545', marginTop: 14, fontSize: 15 },
});
