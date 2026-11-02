import { Image, StyleSheet, Text, View } from 'react-native';
import { FONTS } from './fonts';

// A player's round picture: their photo if they uploaded one, otherwise the
// first letter of their username on green.
export default function Avatar({ username, url, size = 40, ring = false }) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const ringStyle = ring && { borderWidth: Math.round(size / 20), borderColor: '#d4eedf' };
  if (url) {
    return <Image source={{ uri: url }} style={[shape, styles.photo, ringStyle]} />;
  }
  return (
    <View style={[shape, styles.initial, ringStyle]}>
      <Text style={[styles.initialText, { fontSize: size / 2, lineHeight: size * 0.56 }]}>
        {username[0].toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { backgroundColor: '#e8f3ec' },
  initial: { backgroundColor: '#1f9d55', alignItems: 'center', justifyContent: 'center' },
  initialText: { color: '#fff', fontFamily: FONTS.extraBold },
});
