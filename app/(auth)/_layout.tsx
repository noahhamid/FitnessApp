import { useOnboardingColors } from "@/src/ui/tokens";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const C = useOnboardingColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 260,
        contentStyle: { backgroundColor: C.bg },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
