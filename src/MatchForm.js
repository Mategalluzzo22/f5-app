import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { dateToISO, isoToDisplay, todayISO } from './dates';
import { FONTS } from './fonts';
import { RESULTS } from './results';

const MAX_SUGGESTIONS = 6;

export default function MatchForm({ opponents, onSave, onCancel }) {
  const [date, setDate] = useState(new Date());
  const [opponent, setOpponent] = useState('');
  const [result, setResult] = useState(null);
  const [goals, setGoals] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Past rivals that match what was typed, hidden once one is fully chosen.
  const typed = opponent.trim().toLowerCase();
  const suggestions = opponents
    .filter((name) => name.toLowerCase().includes(typed) && name.toLowerCase() !== typed)
    .slice(0, MAX_SUGGESTIONS);

  function handleDateChange(event, selectedDate) {
    if (selectedDate) setDate(selectedDate);
  }

  // On Android the picker is a dialog that has to be opened explicitly.
  function openAndroidPicker() {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'date',
      maximumDate: new Date(),
      onChange: handleDateChange,
    });
  }

  function chooseResult(key) {
    Haptics.selectionAsync();
    setResult(key);
  }

  function changeGoals(newGoals) {
    Haptics.selectionAsync();
    setGoals(Math.max(0, newGoals));
  }

  async function handleSave() {
    const isoDate = dateToISO(date);
    if (isoDate > todayISO()) return setError('No podés cargar un partido que todavía no se jugó.');
    if (!opponent.trim()) return setError('Escribí contra quién jugaste.');
    if (!result) return setError('Elegí el resultado.');
    setError('');
    setSaving(true);
    try {
      await onSave({ date: isoDate, opponent: opponent.trim(), result, goals });
    } catch {
      setSaving(false);
      setError('No se pudo guardar el partido. Revisá tu conexión e intentá de nuevo.');
    }
  }

  return (
    <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled">
      <Header title="Nuevo partido" subtitle="Anotá cómo te fue" onBack={onCancel} />

      <View style={styles.card}>
        <Text style={[styles.label, styles.firstLabel]}>Fecha</Text>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={date}
            mode="date"
            display="compact"
            maximumDate={new Date()}
            onChange={handleDateChange}
            locale="es-AR"
            themeVariant="light"
            style={styles.datePicker}
          />
        ) : (
          <PressableScale style={styles.input} onPress={openAndroidPicker}>
            <Text style={styles.dateText}>{isoToDisplay(dateToISO(date))}</Text>
          </PressableScale>
        )}

        <Text style={styles.label}>Rival</Text>
        <TextInput
          style={styles.input}
          value={opponent}
          onChangeText={setOpponent}
          placeholder="Ej: Los del martes"
        />
        {suggestions.length > 0 && (
          <View style={styles.chips}>
            {suggestions.map((name) => (
              <PressableScale key={name} style={styles.chip} onPress={() => setOpponent(name)}>
                <Text style={styles.chipText}>{name}</Text>
              </PressableScale>
            ))}
          </View>
        )}

        <Text style={styles.label}>Resultado</Text>
        <View style={styles.row}>
          {Object.entries(RESULTS).map(([key, { label, color }]) => {
            const selected = result === key;
            return (
              <PressableScale
                key={key}
                onPress={() => chooseResult(key)}
                style={[styles.option, { borderColor: color }, selected && { backgroundColor: color }]}
              >
                <Text style={[styles.optionText, { color: selected ? '#fff' : color }]}>{label}</Text>
              </PressableScale>
            );
          })}
        </View>

        <Text style={styles.label}>Mis goles</Text>
        <View style={styles.stepper}>
          <PressableScale style={styles.stepButton} onPress={() => changeGoals(goals - 1)}>
            <Text style={styles.stepText}>−</Text>
          </PressableScale>
          <Text style={styles.goals}>{goals}</Text>
          <PressableScale style={styles.stepButton} onPress={() => changeGoals(goals + 1)}>
            <Text style={styles.stepText}>+</Text>
          </PressableScale>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PressableScale
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? 'Guardando…' : 'Guardar partido'}</Text>
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
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: { fontSize: 15, fontWeight: '600', color: '#444', marginTop: 20, marginBottom: 8 },
  firstLabel: { marginTop: 0 },
  input: {
    borderWidth: 1,
    borderColor: '#d0d4da',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  datePicker: { alignSelf: 'flex-start' },
  dateText: { fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { backgroundColor: '#e8f3ec', borderRadius: 16, paddingVertical: 7, paddingHorizontal: 14 },
  chipText: { color: '#1f7a4d', fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, borderWidth: 2, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  optionText: { fontSize: 15, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  stepButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f3ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 26, color: '#1f7a4d', fontWeight: '600' },
  goals: { fontSize: 44, fontFamily: FONTS.extraBold, minWidth: 40, textAlign: 'center' },
  error: { color: '#d64545', marginTop: 16, fontSize: 15 },
  saveButton: {
    backgroundColor: '#1f7a4d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
