import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import { FONTS } from './fonts';
import { groupStats } from './insights';
import { RESULTS } from './results';
import { useColors, useStyles } from './theme';

// "Tus grupos" (Pro): how you do with each group you play with.
export default function GroupsScreen({ matches, onBack }) {
  const styles = useStyles(makeStyles);
  const colors = useColors();
  const groups = groupStats(matches);

  return (
    <ScrollView style={styles.screen}>
      <Header title="Tus grupos" subtitle="Doparti Pro · Cómo te va con cada grupo" onBack={onBack} />
      <View style={styles.cards}>
        {groups.length === 0 ? (
          <View style={[styles.card, styles.empty]}>
            <Ionicons name="people" size={36} color={colors.accent} />
            <Text style={styles.emptyText}>
              Cuando cargues partidos con un grupo (por ejemplo "Los del martes"), acá vas a ver cómo te va con cada uno.
            </Text>
          </View>
        ) : (
          groups.map((group) => <GroupCard key={group.name} group={group} />)
        )}
      </View>
    </ScrollView>
  );
}

function GroupCard({ group }) {
  const styles = useStyles(makeStyles);
  const counts = { win: group.wins, draw: group.draws, loss: group.losses };
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{group.name}</Text>
      <View style={styles.numbers}>
        <GroupNumber value={group.played} label={group.played === 1 ? 'partido' : 'partidos'} />
        <GroupNumber value={`${group.winRate}%`} label="victorias" />
        <GroupNumber value={group.goals} label={group.goals === 1 ? 'gol' : 'goles'} />
        <GroupNumber value={group.goalsPerMatch} label="goles x partido" />
      </View>
      {/* One colored segment per result, like the win rate card on Home. */}
      <View style={styles.bar}>
        {Object.entries(counts)
          .filter(([, count]) => count > 0)
          .map(([key, count]) => (
            <View key={key} style={{ flex: count, backgroundColor: RESULTS[key].color }} />
          ))}
      </View>
      <Text style={styles.record}>
        {group.wins} G · {group.draws} E · {group.losses} P
      </Text>
    </View>
  );
}

function GroupNumber({ value, label }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.number}>
      <Text style={styles.numberValue}>{value}</Text>
      <Text style={styles.numberLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  emptyText: { fontSize: 15, color: c.muted, textAlign: 'center', lineHeight: 21 },
  name: { fontSize: 22, fontFamily: FONTS.bold, color: c.text, marginBottom: 12 },
  numbers: { flexDirection: 'row' },
  number: { flex: 1, alignItems: 'center' },
  numberValue: { fontSize: 28, fontFamily: FONTS.extraBold, color: c.accent },
  numberLabel: { fontSize: 12, color: c.muted, textAlign: 'center' },
  bar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', gap: 3, marginTop: 14 },
  record: { fontSize: 13, color: c.muted, marginTop: 6, textAlign: 'center' },
});
