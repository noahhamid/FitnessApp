import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="goals" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="training-setup" />
      <Stack.Screen name="ready" />
    </Stack>
  );
}
