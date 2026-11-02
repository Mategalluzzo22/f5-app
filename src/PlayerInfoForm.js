import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import PressableScale from './PressableScale';
import { saveProfileCard } from './api';
import { FONTS } from './fonts';
import { FEET, POSITIONS, cardFromForm, formFromProfile } from './playerInfo';
import { useInputProps, useStyles } from './theme';

// "Tu ficha" in Profile: edit your position, foot, shirt number and favorite
// team. Your friends see it on your profile.
export default function PlayerInfoForm({ profile, onSaved }) {
  const styles = useStyles(makeStyles);
  const inputProps = useInputProps();
  const [form, setForm] = useState(() => formFromProfile(profile));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage(null);
  }

  async function save() {
    const { card, error } = cardFromForm(form);
    if (error) {
      setMessage({ error: true, text: error });
      return;
    }
    setSaving(true);
    try {
      onSaved(await saveProfileCard(profile.id, card));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessage({ error: false, text: 'Guardado ✓' });
    } catch (e) {
      if (__DEV__) console.warn('[player card] save failed:', e.message);
      setMessage({ error: true, text: 'No se pudo guardar. Revisá tu conexión e intentá de nuevo.' });
    }
    setSaving(false);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tu ficha</Text>
      <Text style={styles.help}>Tus amigos la ven en tu perfil. Todo es opcional.</Text>

      <Text style={styles.label}>Posición</Text>
      <Options options={POSITIONS} value={form.position} onChange={(v) => update('position', v)} />

      <Text style={styles.label}>Pie hábil</Text>
      <Options options={FEET} value={form.foot} onChange={(v) => update('foot', v)} />

      <View style={styles.row}>
        <View style={styles.numberField}>
          <Text style={styles.label}>Número</Text>
          <TextInput
            style={styles.input}
            value={form.shirtNumber}
            onChangeText={(v) => update('shirtNumber', v)}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="10"
            {...inputProps}
          />
        </View>
        <View style={styles.teamField}>
          <Text style={styles.label}>Equipo favorito</Text>
          <TextInput
            style={styles.input}
            value={form.favoriteTeam}
            onChangeText={(v) => update('favoriteTeam', v)}
            maxLength={40}
            placeholder="Ej: Racing"
            {...inputProps}
          />
        </View>
      </View>

      <PressableScale style={[styles.saveButton, saving && styles.saving]} onPress={save} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Guardando…' : 'Guardar ficha'}</Text>
      </PressableScale>
      {message ? <Text style={message.error ? styles.error : styles.saved}>{message.text}</Text> : null}
    </View>
  );
}

// Chips to pick one option; tapping the selected one clears it.
function Options({ options, value, onChange }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.options}>
      {options.map(([id, label]) => {
        const selected = value === id;
        return (
          <PressableScale
            key={id}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(selected ? null : id);
            }}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
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
  title: { fontSize: 24, fontFamily: FONTS.bold, color: c.text },
  help: { fontSize: 13, color: c.muted, marginTop: 2 },
  label: { fontSize: 15, fontWeight: '600', color: c.textSoft, marginTop: 16, marginBottom: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1.5, borderColor: c.border, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14 },
  optionSelected: { backgroundColor: c.primary, borderColor: c.primary },
  optionText: { fontSize: 14, fontWeight: '700', color: c.textSoft },
  optionTextSelected: { color: c.onPrimary },
  row: { flexDirection: 'row', gap: 12 },
  numberField: { width: 80 },
  teamField: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: c.text,
    backgroundColor: c.card,
  },
  saveButton: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  saving: { opacity: 0.6 },
  saveText: { color: c.onPrimary, fontSize: 16, fontWeight: '700' },
  saved: { color: c.accent, fontSize: 14, fontWeight: '600', marginTop: 10, textAlign: 'center' },
  error: { color: c.danger, fontSize: 14, marginTop: 10, textAlign: 'center' },
});
