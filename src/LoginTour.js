import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import ChartsScreen from './ChartsScreen';
import { FriendProfileView } from './FriendProfileScreen';
import HistoryScreen from './HistoryScreen';
import HomeScreen from './HomeScreen';
import ProBadge from './ProBadge';
import YearScreen from './YearScreen';
import { DEMO_FRIEND, DEMO_FRIEND_MATCHES, DEMO_FRIEND_PROFILE, DEMO_MATCHES, DEMO_ME } from './demoData';
import { FONTS } from './fonts';
import { computeStats } from './stats';
import { useColors } from './theme';

const noop = () => {};
const SCREEN_WIDTH = 375; // the screens are drawn at phone size, then scaled down
const BORDER = 6;
const SLIDE_TIME = 4200;
const useNativeDriver = Platform.OS !== 'web';
// The screens think they're under a small status bar.
const INSETS = { top: 24, bottom: 0, left: 0, right: 0 };

// Each slide shows a real screen with sample matches. `scroll` is how far its
// content slides up while on show, to reveal more of it.
const SLIDES = [
  {
    key: 'history',
    caption: 'Anotá cada partido que jugás',
    scroll: 140,
    screen: () => <HistoryScreen matches={DEMO_MATCHES} pending={[]} onSelect={noop} onConfirm={noop} onLeave={noop} />,
  },
  {
    key: 'home',
    caption: 'Mirá cómo venís en la cancha',
    scroll: 260,
    screen: () => (
      <HomeScreen stats={computeStats(DEMO_MATCHES)} matches={DEMO_MATCHES} myId={DEMO_ME} username="vos" onOpenPro={noop} />
    ),
  },
  {
    key: 'friend',
    caption: 'Compará con tus amigos',
    scroll: 420,
    screen: () => (
      <FriendProfileView
        friend={DEMO_FRIEND}
        myMatches={DEMO_MATCHES}
        friendMatches={DEMO_FRIEND_MATCHES}
        friendProfile={DEMO_FRIEND_PROFILE}
        error=""
        onBack={noop}
        onRemove={noop}
      />
    ),
  },
  {
    key: 'charts',
    caption: 'Tu evolución en gráficos',
    pro: true,
    scroll: 320,
    screen: () => <ChartsScreen matches={DEMO_MATCHES} onBack={noop} />,
  },
  {
    key: 'year',
    caption: 'Tu año en Doparti',
    pro: true,
    scroll: 240,
    screen: () => <YearScreen matches={DEMO_MATCHES} myId={DEMO_ME} onBack={noop} />,
  },
];

// The login "spoiler": a phone that goes through screens of the app by itself
// (it can also be swiped), with a caption and dots below.
export default function LoginTour() {
  const colors = useColors();
  const [size, setSize] = useState(null);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef(null);
  const reveal = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  // The phone gently floats up and down.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(float, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  // On each slide: slide its content up, then move on to the next one.
  useEffect(() => {
    if (!size) return undefined;
    reveal.setValue(0);
    const animation = Animated.sequence([
      Animated.delay(600),
      Animated.timing(reveal, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver }),
    ]);
    animation.start();
    const timer = setTimeout(() => {
      const next = (index + 1) % SLIDES.length;
      scrollRef.current?.scrollTo({ x: next * size.width, animated: true });
      setIndex(next);
    }, SLIDE_TIME);
    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [index, size, reveal]);

  function onLayout(e) {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  }

  if (!size) return <View style={styles.tour} onLayout={onLayout} />;

  // Room for the caption and dots below the phone.
  const phoneHeight = Math.min(460, size.height - 90);
  const phoneWidth = phoneHeight * 0.49;
  const scale = (phoneWidth - BORDER * 2) / SCREEN_WIDTH;
  const innerHeight = (phoneHeight - BORDER * 2) / scale;
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <View style={styles.tour} onLayout={onLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        style={styles.pages}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / size.width))}
      >
        {SLIDES.map((slide, i) => (
          <View key={slide.key} style={[styles.slide, { width: size.width }]}>
            <Animated.View
              style={[
                styles.phone,
                { width: phoneWidth, height: phoneHeight, backgroundColor: colors.background },
                { transform: [{ translateY: floatY }] },
              ]}
            >
              <Animated.View
                pointerEvents="none"
                style={{
                  width: SCREEN_WIDTH,
                  height: innerHeight + slide.scroll,
                  transformOrigin: 'top left',
                  transform: [
                    { scale },
                    {
                      translateY:
                        i === index ? reveal.interpolate({ inputRange: [0, 1], outputRange: [0, -slide.scroll] }) : 0,
                    },
                  ],
                }}
              >
                <SafeAreaInsetsContext.Provider value={INSETS}>{slide.screen()}</SafeAreaInsetsContext.Provider>
              </Animated.View>
            </Animated.View>
            <View style={styles.captionRow}>
              <Text style={styles.caption}>{slide.caption}</Text>
              {slide.pro ? <ProBadge /> : null}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {SLIDES.map((slide, i) => (
          <View key={slide.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tour: { flex: 1, marginHorizontal: -24, justifyContent: 'center' },
  pages: { flexGrow: 0 },
  slide: { alignItems: 'center', paddingTop: 8 },
  phone: {
    borderRadius: 30,
    borderWidth: BORDER,
    borderColor: '#0d1110',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  captionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  caption: { color: '#fff', fontSize: 20, fontFamily: FONTS.bold },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 20, backgroundColor: '#fff' },
});
