import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from './PressableScale';

// Tab bar with a raised round "+" button in the middle (like Mercado Pago's QR button).
export default function BottomBar({ current, onNavigate, onAdd }) {
  const insets = useSafeAreaInsets();

  function handleAdd() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAdd();
  }

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 6 }]}>
      <Tab icon="home" label="Inicio" active={current === 'home'} onPress={() => onNavigate('home')} />
      <Tab
        icon="list"
        label="Partidos"
        active={current === 'history'}
        onPress={() => onNavigate('history')}
      />
      <View style={styles.addSlot}>
        <PressableScale style={styles.addHalo} onPress={handleAdd} accessibilityLabel="Nuevo partido">
          <View style={styles.addButton}>
            <Ionicons name="add" size={34} color="#fff" />
          </View>
        </PressableScale>
      </View>
      <Tab
        icon="people"
        label="Amigos"
        active={current === 'friends'}
        onPress={() => onNavigate('friends')}
      />
      <Tab
        icon="person"
        label="Perfil"
        active={current === 'profile'}
        onPress={() => onNavigate('profile')}
      />
    </View>
  );
}

function Tab({ icon, label, active, onPress }) {
  const color = active ? '#1f7a4d' : '#8a8f98';
  return (
    <PressableScale style={styles.tab} onPress={onPress}>
      <Ionicons name={active ? icon : `${icon}-outline`} size={26} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e6e8eb',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  addSlot: { flex: 1, alignItems: 'center' },
  // Light green ring around the button, raised above the bar.
  addHalo: {
    marginTop: -30,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#d4eedf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#1f9d55',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1f7a4d',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
