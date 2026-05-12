import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

import { COLORS, FONTS } from "@/src/theme";

export default function ExerciseDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Exercise", headerShown: true, headerTintColor: COLORS.text }} />
      <View style={s.wrap}>
        <Text style={s.title}>Exercise</Text>
        <Text style={s.id}>{id}</Text>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg, padding: 24, paddingTop: 16 },
  title: { fontFamily: FONTS.black, fontSize: 28, color: COLORS.text },
  id: { fontFamily: FONTS.regular, color: COLORS.muted, marginTop: 8 },
});
