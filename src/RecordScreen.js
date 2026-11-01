import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableScale from './PressableScale';
import { FONTS } from './fonts';

const CONFETTI_COLORS = ['#ffd54a', '#ffffff', '#7ee2a8', '#ff8a65', '#4fc3f7'];
const CONFETTI_PIECES = 40;

// Full-screen celebration shown after saving a match that beats your goals record.
export default function RecordScreen({ goals, previousBest, onClose }) {
  const insets = useSafeAreaInsets();
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }).start();
  }, [pop]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Confetti />

      <View style={styles.center}>
        <Animated.View style={[styles.trophyHalo, { transform: [{ scale: pop }] }]}>
          <Ionicons name="trophy" size={76} color="#ffd54a" />
        </Animated.View>
        <Text style={styles.kicker}>¡Nuevo récord!</Text>
        <Text style={styles.goals}>{goals}</Text>
        <Text style={styles.goalsLabel}>{goals === 1 ? 'gol' : 'goles'} en un partido</Text>
        <Text style={styles.previous}>
          Tu marca anterior era de {previousBest} {previousBest === 1 ? 'gol' : 'goles'}
        </Text>
      </View>

      <PressableScale style={styles.button} onPress={onClose}>
        <Text style={styles.buttonText}>¡Vamos!</Text>
      </PressableScale>
    </View>
  );
}

function Confetti() {
  const { width, height } = useWindowDimensions();
  // Random but fixed per render, so pieces don't jump around.
  const pieces = useMemo(
    () =>
      Array.from({ length: CONFETTI_PIECES }, (_, i) => ({
        left: Math.random() * width,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 800,
        duration: 2400 + Math.random() * 2000,
        spin: Math.random() > 0.5 ? 1 : -1,
        size: 7 + Math.random() * 6,
      })),
    [width],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, i) => (
        <ConfettiPiece key={i} {...piece} fallTo={height} />
      ))}
    </View>
  );
}

function ConfettiPiece({ left, color, delay, duration, spin, size, fallTo }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration, delay, useNativeDriver: true }).start();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-40, fallTo + 40] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin * 720}deg`] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left,
        width: size,
        height: size * 1.6,
        borderRadius: 2,
        backgroundColor: color,
        transform: [{ translateY }, { rotate }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#155c39', paddingHorizontal: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  trophyHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  kicker: {
    color: '#ffd54a',
    fontSize: 34,
    fontFamily: FONTS.extraBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  goals: { color: '#fff', fontSize: 140, fontFamily: FONTS.extraBold, lineHeight: 150 },
  goalsLabel: { color: '#fff', fontSize: 22, fontFamily: FONTS.bold, marginTop: -8 },
  previous: { color: '#cfeedd', fontSize: 16, marginTop: 16 },
  button: {
    backgroundColor: '#ffd54a',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: { color: '#155c39', fontSize: 22, fontFamily: FONTS.extraBold },
});
