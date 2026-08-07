import {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
  BarlowCondensed_900Black,
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
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { authClient } from "@/src/lib/auth-client";
import { AppThemeProvider, useTheme } from "@/src/context/ThemeContext";
import {
  useAuthHydration,
  useAuthStore,
} from "@/src/features/auth/hooks/useAuth";
import { AnimatedSplashScreen } from "@/src/components/AnimatedSplashScreen";
import { AppSafeAreaChrome } from "@/src/components/AppSafeAreaChrome";

import * as WebBrowser from "expo-web-browser";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useAuthStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  );
  useEffect(() => {
    if (hydrated) return;
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // In case hydration finished between first render and effect.
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);
  return hydrated;
}

/** Inside providers — waits on theme + auth, then releases the branded splash. */
function AppWithBrandedSplash() {
  const fontsReady = true; // fonts already gated before this mounts
  const { hydrated: themeHydrated } = useTheme();
  const authHydrated = useAuthHydration();
  const storeHydrated = useAuthStoreHydrated();
  const ready = fontsReady && themeHydrated && authHydrated && storeHydrated;

  return (
    <AppSafeAreaChrome>
      <AnimatedSplashScreen ready={ready}>
        <ThemeProvider value={DarkTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </AnimatedSplashScreen>
    </AppSafeAreaChrome>
  );
}

export default function RootLayout() {
  // Keys must match fontFamily strings in src/theme.ts (and legacy
  // Barlow/DMSans call sites). Plus Jakarta package exports use
  // PlusJakartaSans_400Regular etc.; theme.ts references hyphenated
  // names, so those are registered under explicit aliases.
  const [loaded, err] = useFonts({
    BarlowCondensed_900Black,
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

  useEffect(() => {
    const cookie = authClient.getCookie?.();
    console.log("STORED SESSION COOKIE ON APP LOAD:", cookie);
  }, []);

  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  // Keep the native splash up until fonts resolve — then hand off to the
  // branded AnimatedSplashScreen (which calls SplashScreen.hideAsync on mount).
  if (!loaded && !err) return null;

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AppWithBrandedSplash />
        </QueryClientProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
