import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import { isoToLongDisplay } from './dates';
import { RESULTS } from './results';

export default function MatchDetailScreen({ match, onBack, onDelete }) {
  // Deleting asks for confirmation first, so a stray tap can't lose a match.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const result = RESULTS[match.result];

  return (
    <View style={styles.screen}>
      <Header title={`vs ${match.opponent}`} subtitle="Detalle del partido" onBack={onBack} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={[styles.card, styles.resultCard]}>
          <View style={[styles.resultBadge, { backgroundColor: result.color }]}>
            <Text style={styles.resultBadgeText}>{result.short}</Text>
          </View>
          <Text style={[styles.resultLabel, { color: result.color }]}>{result.label}</Text>
        </View>

        <View style={[styles.card, styles.goalsCard]}>
          <Ionicons name="football" size={28} color="#1f7a4d" />
          <Text style={styles.goalsNumber}>{match.goals}</Text>
          <Text style={styles.cardLabel}>
            {match.goals === 1 ? 'gol que metiste' : 'goles que metiste'}
          </Text>
        </View>

        <View style={[styles.card, styles.dateCard]}>
          <Ionicons name="calendar" size={24} color="#1f7a4d" />
          <Text style={styles.dateText}>{isoToLongDisplay(match.date)}</Text>
        </View>

        {confirmingDelete ? (
          <View style={[styles.card, styles.confirmCard]}>
            <Text style={styles.confirmText}>¿Seguro que querés eliminar este partido?</Text>
            <View style={styles.confirmButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setConfirmingDelete(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.confirmDeleteButton} onPress={() => onDelete(match.id)}>
                <Text style={styles.confirmDeleteText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.deleteButton} onPress={() => setConfirmingDelete(true)}>
            <Ionicons name="trash-outline" size={20} color="#d64545" />
            <Text style={styles.deleteText}>Eliminar partido</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { marginTop: -32 },
  contentInner: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  resultCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  resultBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  resultLabel: { fontSize: 30, fontWeight: '800' },
  goalsCard: { alignItems: 'center', paddingVertical: 28 },
  goalsNumber: { fontSize: 64, fontWeight: '800', marginTop: 4 },
  cardLabel: { fontSize: 15, color: '#666' },
  dateCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateText: { fontSize: 17, fontWeight: '600', flex: 1 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d64545',
  },
  deleteText: { color: '#d64545', fontSize: 16, fontWeight: '700' },
  confirmCard: { marginTop: 12 },
  confirmText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  confirmButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#eef0f2',
    alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '600', color: '#333' },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#d64545',
    alignItems: 'center',
  },
  confirmDeleteText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
