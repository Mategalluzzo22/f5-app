import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { supabase } from './supabase';

// Passwordless login: we email a 6-digit code and the user types it here.
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendCode() {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError('Escribí un email válido.');
    setError('');
    setLoading(true);
    const { error: sendError } = await supabase.auth.signInWithOtp({ email: cleanEmail });
    setLoading(false);
    if (sendError) return setError('No pudimos mandar el código. Esperá un minuto y probá de nuevo.');
    setEmail(cleanEmail);
    setCodeSent(true);
  }

  async function verifyCode() {
    if (code.trim().length < 6) return setError('El código tiene 6 números.');
    setError('');
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'email',
    });
    setLoading(false);
    // On success App hears about the new session and moves on by itself.
    if (verifyError) setError('El código no es correcto o ya venció.');
  }

  function changeEmail() {
    setCodeSent(false);
    setCode('');
    setError('');
  }

  return (
    <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled">
      <Header title="Bienvenido ⚽" subtitle="Entrá con tu email para guardar tus partidos" />
      <View style={styles.card}>
        {codeSent ? (
          <>
            <Text style={styles.label}>Te mandamos un código a</Text>
            <Text style={styles.email}>{email}</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={10}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Tu email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="vos@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
            />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PressableScale
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={codeSent ? verifyCode : sendCode}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Un momento…' : codeSent ? 'Entrar' : 'Enviarme el código'}
          </Text>
        </PressableScale>

        {codeSent ? (
          <PressableScale style={styles.linkButton} onPress={changeEmail}>
            <Text style={styles.linkText}>Usar otro email</Text>
          </PressableScale>
        ) : null}
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
  label: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 8 },
  email: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#d0d4da',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  codeInput: { fontSize: 28, letterSpacing: 8, textAlign: 'center' },
  error: { color: '#d64545', marginTop: 14, fontSize: 15 },
  button: {
    backgroundColor: '#1f7a4d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  linkButton: { paddingVertical: 14, alignItems: 'center' },
  linkText: { color: '#1f7a4d', fontSize: 15, fontWeight: '600' },
});
