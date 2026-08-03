import { Platform, StatusBar } from "react-native";

/**
 * Single source of truth for "usable" top inset across the app.
 *
 * Previously this exact fallback logic was copy-pasted independently into
 * WorkoutTabHeader, ActiveWorkoutScreen, and WorkoutScreen (and simply
 * missing from WorkoutDetailScreen / ExerciseDetailCard) — so a fix applied
 * to one screen never reached the others. Import this everywhere instead.
 *
 * Note: with Android edgeToEdgeEnabled (see app.config.ts), StatusBar
 * .currentHeight is not authoritative either — react-native-safe-area-context's
 * useSafeAreaInsets() is the real source of truth on both platforms as long
 * as the screen sits under the root SafeAreaProvider (app/_layout.tsx) or,
 * for content rendered in a react-native <Modal> (a separate native root),
 * under its own nested SafeAreaProvider. This helper only guards against the
 * brief window before the first native measurement arrives.
 */
export function topInset(insetsTop: number): number {
  const androidFallback =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;
  return Math.max(insetsTop, androidFallback);
}

/**
 * Usable bottom inset (home indicator / nav gesture bar).
 * Mirrors topInset — prefers the SafeArea measurement, with a small
 * platform floor so floating chrome never sits flush on the hardware edge
 * before the first insets measurement arrives.
 */
export function bottomInset(insetsBottom: number): number {
  const floor = Platform.OS === "ios" ? 16 : 8;
  return Math.max(insetsBottom, floor);
}
