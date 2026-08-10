import { C } from "@/src/ui/tokens";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 260,
        gestureEnabled: true,
        // Without this the transition briefly flashes the default white screen.
        contentStyle: { backgroundColor: C.bg },
      }}
    >
      <Stack.Screen name="gender" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="goal-detail" />
      <Stack.Screen name="focus-areas" />
      <Stack.Screen name="focus-transition" />
      <Stack.Screen name="age" />
      <Stack.Screen name="height" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="target-weight" />
      <Stack.Screen name="pace" />
      <Stack.Screen name="predicted-date" />
      <Stack.Screen name="body-issues" />
      <Stack.Screen name="issues-transition" />
      <Stack.Screen name="injuries" />
      <Stack.Screen name="injuries-transition" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="equipment" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="revised-prediction" />
      <Stack.Screen name="creating-plan" />
      <Stack.Screen name="ready" />
      <Stack.Screen name="paywall" />
    </Stack>
  );
}
