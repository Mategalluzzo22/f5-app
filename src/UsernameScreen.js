import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { createProfile } from './api';

// Same rule as the database check in supabase/schema.sql.
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const UNIQUE_VIOLATION = '23505';

export default function UsernameScreen({ userId, onCreated }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!USERNAME_PATTERN.test(username)) {
      return setError('Usá entre 3 y 20 letras minúsculas, números o _ (sin espacios).');
    }
    setError('');
    setLoading(true);
    try {
      onCreated(await createProfile(userId, username));
    } catch (e) {
      setLoading(false);
      setError(
        e.code === UNIQUE_VIOLATION
          ? 'Ese usuario ya está en uso. Probá con otro.'
          : 'No se pudo guardar. Revisá tu conexión e intentá de nuevo.',
      );
    }
  }

  return (
    <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled">
      <Header title="Elegí tu usuario" subtitle="Así te van a encontrar tus amigos" />
      <View style={styles.card}>
        <Text style={styles.label}>Usuario</Text>
        <View style={styles.inputRow}>
          <Text style={styles.at}>@</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(text) => setUsername(text.toLowerCase().replace(/\s/g, ''))}
            placeholder="tu_usuario"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PressableScale
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Guardando…' : 'Listo'}</Text>
        </PressableScale>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d4da',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  at: { fontSize: 18, color: '#1f7a4d', fontWeight: '700', marginRight: 4 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
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
});
