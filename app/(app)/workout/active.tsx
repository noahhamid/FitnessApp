import { View, Text, StyleSheet } from "react-native";
import { router, Stack } from "expo-router";

import { COLORS, FONTS } from "@/src/theme";
import { Button } from "@/src/ui/components/Button";

export default function ActiveWorkoutRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Live session", headerShown: true, headerTintColor: COLORS.text }} />
      <View style={s.wrap}>
        <Text style={s.title}>Active workout</Text>
        <Text style={s.sub}>Wire this screen to `useActiveWorkout` / `workoutStore`.</Text>
        <Button onPress={() => router.back()} style={{ marginTop: 24 }}>
          End session
        </Button>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg, padding: 24 },
  title: { fontFamily: FONTS.black, fontSize: 26, color: COLORS.text },
  sub: { fontFamily: FONTS.regular, color: COLORS.muted, marginTop: 12, lineHeight: 22 },
});
