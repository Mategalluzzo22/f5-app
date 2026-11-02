import { StyleSheet, Text, View } from 'react-native';
import { FONTS } from './fonts';

// Marks a Doparti Pro feature. Pro features are open to everyone until in-app
// payments arrive with the published app; then they get locked for free users.
export default function ProBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>PRO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { backgroundColor: '#ffd54a', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  text: { color: '#155c39', fontSize: 13, fontFamily: FONTS.extraBold, letterSpacing: 0.5 },
});
