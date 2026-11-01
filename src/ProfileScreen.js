import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from './Header';
import PlayerCard from './PlayerCard';
import PressableScale from './PressableScale';

export default function ProfileScreen({ username, email, stats, onSignOut }) {
  return (
    <ScrollView style={styles.screen}>
      <Header title="Perfil" subtitle="Tu cuenta en Doparti" />
      <View style={styles.cards}>
        <PlayerCard username={username} subtitle={email} stats={stats} />

        <PressableScale style={styles.signOutButton} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#d64545" />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </PressableScale>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  cards: { marginTop: -32, paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
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
