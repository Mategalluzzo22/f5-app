import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import PressableScale from './PressableScale';
import { FONTS } from './fonts';

const AVATAR_SIZE = 104;

// Centered card with a player's photo (or initial), username, a line below it
// and their main numbers. Used for your own profile and for a friend's.
// With onAvatarPress, the photo shows a camera badge and can be tapped to change it.
export default function PlayerCard({ username, avatarUrl, subtitle, stats, onAvatarPress, uploading = false }) {
  const avatar = <Avatar username={username} url={avatarUrl} size={AVATAR_SIZE} ring />;

  return (
    <View style={styles.card}>
      {onAvatarPress ? (
        <PressableScale onPress={onAvatarPress} disabled={uploading} accessibilityLabel="Cambiar foto">
          {avatar}
          {uploading ? (
            <View style={styles.uploading}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </PressableScale>
      ) : (
        avatar
      )}
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
  uploading: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1f7a4d',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: { fontSize: 32, fontFamily: FONTS.extraBold, marginTop: 14 },
  subtitle: { fontSize: 15, color: '#666', marginTop: 2 },
  divider: { alignSelf: 'stretch', height: 1, backgroundColor: '#eef0f2', marginVertical: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'stretch', rowGap: 18 },
  stat: { width: '50%', alignItems: 'center' },
  statValue: { fontSize: 40, fontFamily: FONTS.extraBold, color: '#1f7a4d', lineHeight: 44 },
  statLabel: { fontSize: 14, color: '#666' },
});
