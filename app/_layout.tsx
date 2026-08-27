import {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
  BarlowCondensed_900Black,
  BarlowCondensed_900Black_Italic,
} from "@expo-google-fonts/barlow-condensed";
import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { AppThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { AppSafeAreaChrome } from "@/src/components/AppSafeAreaChrome";
import { IapProvider } from "@/src/features/billing/IapProvider";
import { LoadingScreen } from "@/src/ui/components/LoadingScreen";
import * as WebBrowser from "expo-web-browser";
import { Sentry, sentryEnabled } from "@/src/lib/sentry";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient();

function AppShell() {
  const { resolved, theme } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = resolved === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.accent,
        background: theme.bg,
        card: theme.bg,
        text: theme.text,
        border: theme.border,
        notification: theme.accent,
      },
    };
  }, [resolved, theme]);

  return (
    <AppSafeAreaChrome>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="paywall"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </AppSafeAreaChrome>
  );
}

function RootLayout() {
  // Keys must match fontFamily strings in src/theme.ts (and legacy
  // Barlow/DMSans call sites). Plus Jakarta package exports use
  // PlusJakartaSans_400Regular etc.; theme.ts references hyphenated
  // names, so those are registered under explicit aliases.
  const [loaded, err] = useFonts({
    BarlowCondensed_900Black,
    BarlowCondensed_900Black_Italic,
    BarlowCondensed_800ExtraBold,
    BarlowCondensed_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
    "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
  });

  // Custom Tabs warm-up is Android/iOS only — throws on web.
  useEffect(() => {
    if (Platform.OS === "web") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // Keep the native splash up until index / LoadingScreen / welcome hide it.
  // Do not swap in a second logo plate while fonts load (guests go to welcome).
  useEffect(() => {
  if (!loaded && !err) return;
  void SplashScreen.hideAsync().catch(() => undefined);
}, [loaded, err]);

if (!loaded && !err) return <LoadingScreen />;

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <IapProvider>
            <AppShell />
          </IapProvider>
        </QueryClientProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

export default sentryEnabled ? Sentry.wrap(RootLayout) : RootLayout;
