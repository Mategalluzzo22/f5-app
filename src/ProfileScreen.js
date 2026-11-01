import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PressableScale from './PressableScale';
import { FONTS } from './fonts';

export default function ProfileScreen({ username, email, stats, onSignOut }) {
  return (
    <ScrollView style={styles.screen}>
      <Header title="Perfil" subtitle="Tu cuenta en Doparti" />
      <View style={styles.cards}>
        <View style={[styles.card, styles.profileCard]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.divider} />

          <View style={styles.statsGrid}>
            <Stat value={stats.played} label={stats.played === 1 ? 'partido' : 'partidos'} />
            <Stat value={`${stats.winRate}%`} label="victorias" />
            <Stat value={stats.goals} label={stats.goals === 1 ? 'gol' : 'goles'} />
            <Stat value={stats.winStreak} label="mejor racha" />
          </View>
        </View>

        <PressableScale style={styles.signOutButton} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#d64545" />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </PressableScale>
      </View>
    </ScrollView>
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
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileCard: { alignItems: 'center' },
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
  email: { fontSize: 15, color: '#666', marginTop: 2 },
  divider: { alignSelf: 'stretch', height: 1, backgroundColor: '#eef0f2', marginVertical: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'stretch', rowGap: 18 },
  stat: { width: '50%', alignItems: 'center' },
  statValue: { fontSize: 40, fontFamily: FONTS.extraBold, color: '#1f7a4d', lineHeight: 44 },
  statLabel: { fontSize: 14, color: '#666' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d64545',
    backgroundColor: '#fff',
  },
  signOutText: { color: '#d64545', fontSize: 16, fontWeight: '700' },
});
