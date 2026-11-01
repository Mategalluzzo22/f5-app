import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// A Pressable that shrinks a little while pressed and springs back on release.
export default function PressableScale({ style, onPressIn, onPressOut, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(value) {
    Animated.spring(scale, { toValue: value, speed: 40, bounciness: 8, useNativeDriver: true }).start();
  }

  return (
    <AnimatedPressable
      {...props}
      style={[style, { transform: [{ scale }] }]}
      onPressIn={(e) => {
        animateTo(0.95);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        onPressOut?.(e);
      }}
    />
  );
}
