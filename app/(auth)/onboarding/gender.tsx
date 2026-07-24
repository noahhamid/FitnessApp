import { ProgressDots } from '@/src/ui/components/ProgressDots';
import { FONTS } from '@/src/ui/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

type GenderOption = 'male' | 'female';

const GENDERS: { id: GenderOption; label: string; desc: string; image: any }[] =
  [
    {
      id: 'male',
      label: 'MALE',
      desc: 'Optimized for higher baseline metabolic tracking.',
      image: require('../../../assets/images/gendermale.jpg'),
    },
    {
      id: 'female',
      label: 'FEMALE',
      desc: 'Optimized for cycle-aware biometric analysis.',
      image: require('../../../assets/images/genderfemale.jpg'),
    },
  ];

export default function OnboardingGenderScreen() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const C = {
    bg: isDark ? '#080808' : '#FFFFFF',
    card: isDark ? '#141414' : '#F4F4F5',
    border: isDark ? '#262626' : '#E4E4E7',
    accent: '#D32F2F',
    text: '#FFFFFF',
    muted: 'rgba(255, 255, 255, 0.75)',
    cardSelectedBg: 'rgba(211, 47, 47, 0.15)',
  };

  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(
    null,
  );

  const handleNext = () => {
    if (!selectedGender) return;
    router.push({
      pathname: '/(auth)/onboarding/age',
      params: { ...params, gender: selectedGender },
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
          <Text style={[s.counter, { color: '#030303' }]}>STEP 2 OF 4</Text>
          <ProgressDots total={4} current={2} />
        </View>

        {/* Title, Subtitle, and Massive Logo Flex Row */}
        <View style={s.titleLogoRow}>
          <View style={s.titleTextGroup}>
            <Text style={[s.headline, { color: '#000000' }]}>
              YOUR{'\n'}GENDER.
            </Text>
            <Text style={[s.sub, { color: 'rgba(29, 28, 28, 0.7)' }]}>
              This helps us calibrate your baseline metrics.
            </Text>
          </View>

          <View style={s.logoContainer}>
            <Image
              source={require('../../../assets/images/potentialpeak_logo_nobackground.jpg')}
              style={s.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Two Quadrant / Full-Fill Cards Layout */}
      <View style={s.quadrantsContainer}>
        {GENDERS.map((g) => {
          const isSelected = selectedGender === g.id;
          return (
            <Pressable
              key={g.id}
              style={[
                s.quadrantCard,
                {
                  backgroundColor: C.card,
                  borderColor: isSelected ? C.accent : C.border,
                },
                isSelected && {
                  backgroundColor: C.cardSelectedBg,
                  borderColor: C.accent,
                },
              ]}
              onPress={() => setSelectedGender(g.id)}
            >
              <Image
                source={g.image}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />

              {/* Dark Gradient Overlay for optimal text legibility */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={s.radioAbsoluteWrapper}>
                <View
                  style={[
                    s.radio,
                    {
                      borderColor: isSelected
                        ? C.accent
                        : 'rgba(255,255,255,0.4)',
                    },
                    isSelected && {
                      backgroundColor: C.accent,
                      borderColor: C.accent,
                    },
                  ]}
                >
                  {isSelected && <View style={s.radioInnerDot} />}
                </View>
              </View>

              <View style={s.quadrantContent}>
                <Text style={[s.quadrantTitle, { color: '#FFFFFF' }]}>
                  {g.label}
                </Text>
                <Text
                  style={[s.quadrantDesc, { color: C.muted }]}
                  numberOfLines={2}
                >
                  {g.desc}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={s.footerContainer}>
        <View style={s.nav}>
          <Pressable
            style={[
              s.backBtn,
              { borderColor: C.border, backgroundColor: C.card },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[s.backText, { color: C.text }]}>← BACK</Text>
          </Pressable>

          <Pressable
            disabled={!selectedGender}
            style={[
              s.nextBtn,
              { backgroundColor: C.accent, shadowColor: C.accent },
              !selectedGender && s.nextBtnDisabled,
            ]}
            onPress={handleNext}
          >
            <Text style={[s.nextText, { color: '#FFFFFF' }]}>CONTINUE →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 24,
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
    marginBottom: 4,
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
  quadrantsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
    zIndex: 1,
  },
  quadrantCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    justifyContent: 'flex-end',
    padding: 16,
    position: 'relative',
  },
  quadrantContent: {
    zIndex: 2,
  },
  quadrantTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quadrantDesc: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  radioAbsoluteWrapper: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  footerContainer: {
    gap: 12,
    zIndex: 1,
  },
  nav: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 0.8,
  },
  nextBtn: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnDisabled: {
    opacity: 0.35,
    shadowOpacity: 0,
  },
  nextText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    letterSpacing: 1,
  },
});
