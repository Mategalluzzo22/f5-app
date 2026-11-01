import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { fetchFriends } from './api';
import { dateToISO, isoToDisplay, todayISO } from './dates';
import { FONTS } from './fonts';

const MAX_SUGGESTIONS = 6;
const FORMATS = [5, 7, 8, 11];

export default function MatchForm({ myId, groups, onSave, onCancel }) {
  const [date, setDate] = useState(new Date());
  const [format, setFormat] = useState(5);
  const [group, setGroup] = useState('');
  const [scoreFor, setScoreFor] = useState(0);
  const [scoreAgainst, setScoreAgainst] = useState(0);
  const [goals, setGoals] = useState(0);
  const [goalsUnknown, setGoalsUnknown] = useState(false);
  // friendId -> 'A' (my team) | 'B' (rivals)
  const [teams, setTeams] = useState({});
  const [friends, setFriends] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFriends(myId).then(setFriends, () => setFriends([]));
  }, []);

  // Past groups that match what was typed, hidden once one is fully chosen.
  const typed = group.trim().toLowerCase();
  const suggestions = groups
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

  // Tapping the team a friend is already in takes them out of the match.
  function toggleTeam(friendId, team) {
    Haptics.selectionAsync();
    setTeams((current) => {
      const next = { ...current };
      if (next[friendId] === team) delete next[friendId];
      else next[friendId] = team;
      return next;
    });
  }

  async function handleSave() {
    const isoDate = dateToISO(date);
    if (isoDate > todayISO()) return setError('No podés cargar un partido que todavía no se jugó.');
    setError('');
    setSaving(true);
    try {
      await onSave({
        date: isoDate,
        format,
        group: group.trim(),
        scoreFor,
        scoreAgainst,
        goals: goalsUnknown ? null : goals,
        players: Object.entries(teams).map(([userId, team]) => ({ user_id: userId, team })),
      });
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

        <Text style={styles.label}>Formato</Text>
        <View style={styles.row}>
          {FORMATS.map((size) => (
            <PressableScale
              key={size}
              onPress={() => setFormat(size)}
              style={[styles.option, format === size && styles.optionSelected]}
            >
              <Text style={[styles.optionText, format === size && styles.optionTextSelected]}>
                F{size}
              </Text>
            </PressableScale>
          ))}
        </View>

        <Text style={styles.label}>Marcador</Text>
        <View style={styles.scoreRow}>
          <ScoreStepper label="Tu equipo" value={scoreFor} onChange={setScoreFor} />
          <Text style={styles.scoreDash}>-</Text>
          <ScoreStepper label="Rival" value={scoreAgainst} onChange={setScoreAgainst} />
        </View>

        <Text style={styles.label}>Tus goles</Text>
        <View style={styles.goalsRow}>
          <Stepper value={goals} onChange={setGoals} disabled={goalsUnknown} />
          <PressableScale
            style={[styles.unknownChip, goalsUnknown && styles.optionSelected]}
            onPress={() => setGoalsUnknown(!goalsUnknown)}
          >
            <Text style={[styles.unknownText, goalsUnknown && styles.optionTextSelected]}>Sin dato</Text>
          </PressableScale>
        </View>

        <Text style={styles.label}>
          Grupo <Text style={styles.optional}>(opcional)</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={group}
          onChangeText={setGroup}
          placeholder="Ej: Los del martes"
          maxLength={60}
        />
        {suggestions.length > 0 && (
          <View style={styles.chips}>
            {suggestions.map((name) => (
              <PressableScale key={name} style={styles.chip} onPress={() => setGroup(name)}>
                <Text style={styles.chipText}>{name}</Text>
              </PressableScale>
            ))}
          </View>
        )}

        <Text style={styles.label}>
          Amigos que jugaron <Text style={styles.optional}>(opcional)</Text>
        </Text>
        {friends === null ? null : friends.length === 0 ? (
          <Text style={styles.muted}>
            Agregá amigos en la pestaña Amigos para sumarlos a tus partidos.
          </Text>
        ) : (
          <>
            <Text style={styles.muted}>Les va a llegar el partido para que lo confirmen.</Text>
            {friends.map((friend) => (
              <View key={friend.id} style={styles.friendRow}>
                <Text style={styles.friendName}>@{friend.username}</Text>
                {[
                  ['A', 'Mi equipo'],
                  ['B', 'Rival'],
                ].map(([team, label]) => {
                  const selected = teams[friend.id] === team;
                  return (
                    <PressableScale
                      key={team}
                      style={[styles.teamChip, selected && styles.optionSelected]}
                      onPress={() => toggleTeam(friend.id, team)}
                    >
                      <Text style={[styles.teamChipText, selected && styles.optionTextSelected]}>
                        {label}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            ))}
          </>
        )}

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

function Stepper({ value, onChange, disabled = false }) {
  function change(newValue) {
    Haptics.selectionAsync();
    onChange(Math.max(0, newValue));
  }
  return (
    <View style={[styles.stepper, disabled && styles.disabled]}>
      <PressableScale style={styles.stepButton} onPress={() => change(value - 1)} disabled={disabled}>
        <Text style={styles.stepText}>−</Text>
      </PressableScale>
      <Text style={styles.stepValue}>{disabled ? '–' : value}</Text>
      <PressableScale style={styles.stepButton} onPress={() => change(value + 1)} disabled={disabled}>
        <Text style={styles.stepText}>+</Text>
      </PressableScale>
    </View>
  );
}

function ScoreStepper({ label, value, onChange }) {
  return (
    <View style={styles.scoreSide}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Stepper value={value} onChange={onChange} />
    </View>
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
  optional: { fontWeight: '400', color: '#8a8f98' },
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
  option: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#d0d4da',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionSelected: { backgroundColor: '#1f7a4d', borderColor: '#1f7a4d' },
  optionText: { fontSize: 15, fontWeight: '700', color: '#444' },
  optionTextSelected: { color: '#fff' },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  scoreSide: { alignItems: 'center' },
  scoreLabel: { fontSize: 13, color: '#666', marginBottom: 6 },
  scoreDash: { fontSize: 32, fontFamily: FONTS.extraBold, color: '#8a8f98', marginBottom: 6 },
  goalsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  disabled: { opacity: 0.4 },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f3ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 22, color: '#1f7a4d', fontWeight: '600' },
  stepValue: { fontSize: 40, fontFamily: FONTS.extraBold, minWidth: 36, textAlign: 'center' },
  unknownChip: {
    borderWidth: 2,
    borderColor: '#d0d4da',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  unknownText: { fontSize: 14, fontWeight: '700', color: '#444' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { backgroundColor: '#e8f3ec', borderRadius: 16, paddingVertical: 7, paddingHorizontal: 14 },
  chipText: { color: '#1f7a4d', fontSize: 14, fontWeight: '600' },
  muted: { color: '#666', fontSize: 14, marginBottom: 4 },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  friendName: { flex: 1, fontSize: 15, fontWeight: '600' },
  teamChip: {
    borderWidth: 2,
    borderColor: '#d0d4da',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  teamChipText: { fontSize: 13, fontWeight: '700', color: '#444' },
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
