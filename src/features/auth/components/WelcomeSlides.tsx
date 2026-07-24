import { useEffect } from 'react';
import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS } from '@/src/ui/tokens';

// Define your color palettes for both modes
const THEMES = {
  dark: {
    bg: '#080808',
    red: '#D32F2F',
    text: '#FFFFFF',
    muted: 'rgba(255, 255, 255, 0.65)',
    wrapperBg: '#121212',
  },
  light: {
    bg: '#F9F9F9',
    red: '#D32F2F',
    text: '#111111',
    muted: 'rgba(0, 0, 0, 0.60)',
    wrapperBg: '#FFFFFF',
  },
};

export function WelcomeSlides() {
  // Get current color scheme ('light', 'dark', or null/undefined)
  const colorScheme = useColorScheme();

  // Fallback to 'dark' if scheme is unavailable
  const theme = THEMES[colorScheme === 'light' ? 'light' : 'dark'];

  useEffect(() => {
    // Automatically navigate to the next screen after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding/goals');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={theme.bg}
      />
      <SafeAreaView style={s.content}>
        <View style={s.logoContainer}>
          <View
            style={[
              s.imageWrapper,
              {
                borderColor: theme.red,
                backgroundColor: theme.wrapperBg,
                shadowColor: theme.red,
              },
            ]}
          >
            <Image
              source={require('../../../../assets/images/potentialpeak_logo.jpg')}
              style={s.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={[s.brand, { color: theme.text }]}>
            Potential<Text style={[s.redtext, { color: theme.red }]}>Peak</Text>
          </Text>
          <Text style={[s.sub, { color: theme.muted }]}>
            Push. Grow. Repeat.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brand: {
    fontFamily: FONTS.extraBold,
    fontSize: 46,
    letterSpacing: -1,
  },
  redtext: {},
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
