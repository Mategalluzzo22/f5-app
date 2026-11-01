import { StyleSheet, Text, View } from 'react-native';
import { FONTS } from './fonts';

// Centered card with a player's initial, username, a line below it and their
// main numbers. Used for your own profile and for a friend's.
export default function PlayerCard({ username, subtitle, stats }) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{username[0].toUpperCase()}</Text>
      </View>
      <Text style={styles.username}>@{username}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.divider} />

      <View style={styles.statsGrid}>
        <Stat value={stats.played} label={stats.played === 1 ? 'partido' : 'partidos'} />
        <Stat value={`${stats.winRate}%`} label="victorias" />
        <Stat value={stats.goals} label={stats.goals === 1 ? 'gol' : 'goles'} />
        <Stat value={stats.winStreak} label="mejor racha" />
      </View>
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#1f9d55',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#d4eedf',
  },
  avatarText: { color: '#fff', fontSize: 52, fontFamily: FONTS.extraBold, lineHeight: 58 },
  username: { fontSize: 32, fontFamily: FONTS.extraBold, marginTop: 14 },
  subtitle: { fontSize: 15, color: '#666', marginTop: 2 },
  divider: { alignSelf: 'stretch', height: 1, backgroundColor: '#eef0f2', marginVertical: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'stretch', rowGap: 18 },
  stat: { width: '50%', alignItems: 'center' },
  statValue: { fontSize: 40, fontFamily: FONTS.extraBold, color: '#1f7a4d', lineHeight: 44 },
  statLabel: { fontSize: 14, color: '#666' },
});
