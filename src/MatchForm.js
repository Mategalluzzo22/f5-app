import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { dateToISO, isoToDisplay, todayISO } from './dates';
import { RESULTS } from './results';

export default function MatchForm({ onSave, onCancel }) {
  const [date, setDate] = useState(new Date());
  const [opponent, setOpponent] = useState('');
  const [result, setResult] = useState(null);
  const [goals, setGoals] = useState(0);
  const [error, setError] = useState('');

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

  function handleSave() {
    const isoDate = dateToISO(date);
    if (isoDate > todayISO()) return setError('No podés cargar un partido que todavía no se jugó.');
    if (!opponent.trim()) return setError('Escribí contra quién jugaste.');
    if (!result) return setError('Elegí el resultado.');
    onSave({ id: String(Date.now()), date: isoDate, opponent: opponent.trim(), result, goals });
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nuevo partido</Text>

      <Text style={styles.label}>Fecha</Text>
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
        <Pressable style={styles.input} onPress={openAndroidPicker}>
          <Text style={styles.dateText}>{isoToDisplay(dateToISO(date))}</Text>
        </Pressable>
      )}

      <Text style={styles.label}>Rival</Text>
      <TextInput
        style={styles.input}
        value={opponent}
        onChangeText={setOpponent}
        placeholder="Ej: Los del martes"
      />

      <Text style={styles.label}>Resultado</Text>
      <View style={styles.row}>
        {Object.entries(RESULTS).map(([key, { label, color }]) => {
          const selected = result === key;
          return (
            <Pressable
              key={key}
              onPress={() => setResult(key)}
              style={[styles.option, { borderColor: color }, selected && { backgroundColor: color }]}
            >
              <Text style={[styles.optionText, { color: selected ? '#fff' : color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Mis goles</Text>
      <View style={styles.stepper}>
        <Pressable style={styles.stepButton} onPress={() => setGoals(Math.max(0, goals - 1))}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <Text style={styles.goals}>{goals}</Text>
        <Pressable style={styles.stepButton} onPress={() => setGoals(goals + 1)}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Guardar partido</Text>
      </Pressable>
      <Pressable style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 15, fontWeight: '600', color: '#444', marginTop: 16, marginBottom: 6 },
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
  goals: { fontSize: 32, fontWeight: '700', minWidth: 40, textAlign: 'center' },
  error: { color: '#d64545', marginTop: 16, fontSize: 15 },
  saveButton: {
    backgroundColor: '#1f7a4d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cancelButton: { paddingVertical: 14, alignItems: 'center' },
  cancelText: { color: '#666', fontSize: 16 },
});
