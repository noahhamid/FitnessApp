import { ProgressDots } from '@/src/ui/components/ProgressDots';
import { FONTS } from '@/src/ui/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

const GOALS = [
  {
    id: 'lose',
    image: require('../../../../assets/images/losefat.jpg'),
    title: 'Lose Fat',
    desc: 'Cut down, stay strong.',
  },
  {
    id: 'build',
    image: require('../../../../assets/images/buildmuscle.jpg'),
    title: 'Build Muscle',
    desc: 'Gain size and strength.',
  },
  {
    id: 'endure',
    image: require('../../../../assets/images/buildendurance.jpg'),
    title: 'Build Endurance',
    desc: 'Push your conditioning.',
  },
  {
    id: 'health',
    image: require('../../../../assets/images/stayhealthy.jpg'),
    title: 'Stay Healthy',
    desc: 'Balanced, sustainable fitness.',
  },
];

export function GoalsForm() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const C = {
    bg: isDark ? '#080808' : '#FFFFFF',
    border: isDark ? '#262626' : '#E4E4E7',
    accent: '#D32F2F',
    text: '#FFFFFF',
    muted: 'rgba(255, 255, 255, 0.75)',
    // Dynamic text colors based on theme mode to prevent overshadowing
    headerTitle: isDark ? '#FFFFFF' : '#000000',
    headerSub: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(29, 28, 28, 0.7)',
    counter: isDark ? '#A1A1AA' : '#030303',
  };

  const [selected, setSelected] = useState<string | null>(null);

  const animLose = useRef(new Animated.Value(0)).current;
  const animBuild = useRef(new Animated.Value(0)).current;
  const animEndure = useRef(new Animated.Value(0)).current;
  const animHealth = useRef(new Animated.Value(0)).current;

  const animMap: Record<string, Animated.Value> = {
    lose: animLose,
    build: animBuild,
    endure: animEndure,
    health: animHealth,
  };

  const handleSelect = (id: string) => {
    setSelected(id);
    Object.keys(animMap).forEach((key) => {
      Animated.timing(animMap[key], {
        toValue: key === id ? 1 : 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={C.bg}
      />

      {/* Immersive Left-to-Right Header Gradient */}
      <LinearGradient
        colors={['transparent', 'transparent', '#b71c1c', '#B71C1C']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.05 }}
        style={s.headerGradient}
      />

      <View style={s.header}>
        {/* Step Counter & Progress Dots */}
        <View style={s.stepRow}>
          <Text style={[s.counter, { color: C.counter }]}>STEP 1 OF 4</Text>
          <ProgressDots total={4} current={0} />
        </View>

        {/* Title, Subtitle, and Massive Logo Flex Row */}
        <View style={s.titleLogoRow}>
          <View style={s.titleTextGroup}>
            <Text style={[s.headline, { color: C.headerTitle }]}>
              YOUR{'\n'}GOAL.
            </Text>
            <Text style={[s.sub, { color: C.headerSub }]}>
              What are you training for?
            </Text>
          </View>

          <View style={s.logoContainer}>
            <Image
              source={require('../../../../assets/images/potentialpeak_logo_nobackground.jpg')}
              style={s.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <View style={s.gridContainer}>
        <View style={s.gridRow}>
          {GOALS.slice(0, 2).map((g) => {
            const isSelected = selected === g.id;
            const scale = animMap[g.id].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.15],
            });
            const overlayOpacity = animMap[g.id].interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0.35],
            });

            return (
              <Pressable
                key={g.id}
                style={[
                  s.quadrant,
                  { borderColor: C.border },
                  isSelected && s.quadrantSelected,
                ]}
                onPress={() => handleSelect(g.id)}
              >
                <Animated.Image
                  source={g.image}
                  style={[s.cardImage, { transform: [{ scale }] }]}
                  resizeMode="cover"
                />
                <Animated.View
                  style={[s.overlay, { opacity: overlayOpacity }]}
                />

                <View style={s.cardContent}>
                  <View />
                  <View>
                    <Text style={[s.cardTitle, { color: C.text }]}>
                      {g.title}
                    </Text>
                    <Text
                      style={[s.cardDesc, { color: C.muted }]}
                      numberOfLines={2}
                    >
                      {g.desc}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={s.gridRow}>
          {GOALS.slice(2, 4).map((g) => {
            const isSelected = selected === g.id;
            const scale = animMap[g.id].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.15],
            });
            const overlayOpacity = animMap[g.id].interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0.35],
            });

            return (
              <Pressable
                key={g.id}
                style={[
                  s.quadrant,
                  { borderColor: C.border },
                  isSelected && s.quadrantSelected,
                ]}
                onPress={() => handleSelect(g.id)}
              >
                <Animated.Image
                  source={g.image}
                  style={[s.cardImage, { transform: [{ scale }] }]}
                  resizeMode="cover"
                />
                <Animated.View
                  style={[s.overlay, { opacity: overlayOpacity }]}
                />

                <View style={s.cardContent}>
                  <View />
                  <View>
                    <Text style={[s.cardTitle, { color: C.text }]}>
                      {g.title}
                    </Text>
                    <Text
                      style={[s.cardDesc, { color: C.muted }]}
                      numberOfLines={2}
                    >
                      {g.desc}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        disabled={!selected}
        style={[
          s.primaryBtn,
          { backgroundColor: C.accent, shadowColor: C.accent },
          !selected && s.primaryBtnDisabled,
        ]}
        onPress={() =>
          router.push({
            pathname: '/(auth)/onboarding/gender',
            params: { goalId: selected! },
          })
        }
      >
        <Text style={[s.primaryBtnText, { color: '#FFFFFF' }]}>CONTINUE →</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 12,
    justifyContent: 'space-between',
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 30,
    right: 0,
    height: 176.5,
    zIndex: 0,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 8,
    zIndex: 1,
  },
  stepRow: {
    marginTop: 16,
  },
  titleLogoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -30,
    position: 'relative',
  },
  titleTextGroup: {
    flex: 1,
  },
  logoContainer: {
    height: 140,
    width: 140,
    right: -16,
    marginBottom: -23,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  counter: {
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  headline: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    marginTop: 6,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 0,
    zIndex: 1,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 0,
  },
  quadrant: {
    flex: 1,
    borderWidth: 0.5,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  quadrantSelected: {
    zIndex: 10,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  cardContent: {
    padding: 16,
    justifyContent: 'space-between',
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  cardDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  primaryBtn: {
    marginHorizontal: 1,
    paddingVertical: 18,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  primaryBtnDisabled: {
    opacity: 0.35,
    shadowOpacity: 0,
  },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    letterSpacing: 1,
  },
});
