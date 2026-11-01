import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Green band at the top of the main screens. Cards below it overlap it a bit.
export default function Header({ title, subtitle }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1f7a4d', paddingHorizontal: 20, paddingBottom: 52 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#cfeedd', fontSize: 15, marginTop: 4 },
});
