import { StyleSheet, View } from 'react-native';

const STRIPES = 8;
const LINE = 'rgba(255,255,255,0.14)';

// A football pitch drawn behind content: mowed-grass stripes, halfway line and
// center circle. In the header the circle peeks in from the right; with `centered`
// it fills a whole screen, with the halfway line across the middle.
export default function PitchBackground({ centered = false }) {
  const circleSize = centered ? 220 : 200;
  return (
    <View style={[styles.pitch, centered && styles.pitchColumn]} pointerEvents="none">
      {Array.from({ length: STRIPES }, (_, i) => (
        <View key={i} style={[styles.stripe, i % 2 === 1 && styles.stripeLight]} />
      ))}
      <View style={centered ? styles.halfwayLineAcross : styles.halfwayLineDown} />
      <View
        style={[
          styles.circle,
          { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
          centered ? centeredAt(circleSize) : headerCircle(circleSize),
        ]}
      />
      <View style={[styles.spot, centered ? centeredAt(8) : headerCircle(8)]} />
    </View>
  );
}

// In the header the circle's center sits 60px in from the right, 70px from the top.
function headerCircle(size) {
  return { right: 60 - size / 2, top: 70 - size / 2 };
}

function centeredAt(size) {
  return { left: '50%', top: '50%', marginLeft: -size / 2, marginTop: -size / 2 };
}

const styles = StyleSheet.create({
  pitch: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  pitchColumn: { flexDirection: 'column' },
  stripe: { flex: 1 },
  stripeLight: { backgroundColor: 'rgba(255,255,255,0.04)' },
  halfwayLineDown: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 59,
    width: 2,
    backgroundColor: LINE,
  },
  halfwayLineAcross: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    marginTop: -1,
    backgroundColor: LINE,
  },
  circle: { position: 'absolute', borderWidth: 2, borderColor: LINE },
  spot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: LINE },
});
