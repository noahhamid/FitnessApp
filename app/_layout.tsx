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
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { authClient } from "@/src/lib/auth-client";
import { AppThemeProvider } from "@/src/context/ThemeContext";

import * as WebBrowser from "expo-web-browser";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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

  useEffect(() => {
    if (loaded || err) SplashScreen.hideAsync();
  }, [loaded, err]);

  if (!loaded && !err) return null;

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={DarkTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </QueryClientProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
