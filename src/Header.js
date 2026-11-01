import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Green band at the top of the main screens. Cards below it overlap it a bit.
export default function Header({ title, subtitle, onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      {onBack ? (
        <Pressable style={styles.back} onPress={onBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1f7a4d', paddingHorizontal: 20, paddingBottom: 52 },
  back: { flexDirection: 'row', alignItems: 'center', marginLeft: -6, marginBottom: 10 },
  backText: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#cfeedd', fontSize: 15, marginTop: 4 },
});
