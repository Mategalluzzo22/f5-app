import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from './PressableScale';
import { FONTS } from './fonts';

const STRIPES = 8;

// Green band at the top of the screens, drawn like a football pitch
// (mowed-grass stripes, halfway line and center circle). Cards below it overlap it a bit.
export default function Header({ title, subtitle, onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.pitch} pointerEvents="none">
        {Array.from({ length: STRIPES }, (_, i) => (
          <View key={i} style={[styles.stripe, i % 2 === 1 && styles.stripeLight]} />
        ))}
        <View style={styles.halfwayLine} />
        <View style={styles.centerCircle} />
        <View style={styles.centerSpot} />
      </View>

      {onBack ? (
        <PressableScale style={styles.back} onPress={onBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.backText}>Volver</Text>
        </PressableScale>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const LINE = 'rgba(255,255,255,0.14)';
// Center of the circle: 60px in from the right edge, 70px from the top.
const CIRCLE_SIZE = 200;
const CENTER_RIGHT = 60;
const CENTER_TOP = 70;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1f7a4d',
    paddingHorizontal: 20,
    paddingBottom: 52,
    overflow: 'hidden',
  },
  pitch: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  stripe: { flex: 1 },
  stripeLight: { backgroundColor: 'rgba(255,255,255,0.04)' },
  halfwayLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: CENTER_RIGHT - 1,
    width: 2,
    backgroundColor: LINE,
  },
  centerCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: LINE,
    right: CENTER_RIGHT - CIRCLE_SIZE / 2,
    top: CENTER_TOP - CIRCLE_SIZE / 2,
  },
  centerSpot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LINE,
    right: CENTER_RIGHT - 4,
    top: CENTER_TOP - 4,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: -6,
    marginBottom: 10,
  },
  backText: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 36, fontFamily: FONTS.extraBold },
  subtitle: { color: '#cfeedd', fontSize: 15, marginTop: 2 },
});
