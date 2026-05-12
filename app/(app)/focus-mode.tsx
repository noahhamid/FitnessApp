import { View, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";

import { BlockedAppsPanel, FocusTimer, SessionStats } from "@/src/features/focus";
import { COLORS } from "@/src/theme";
import { Button } from "@/src/ui/components/Button";

export default function FocusModeRoute() {
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <FocusTimer />
      <View style={{ height: 24 }} />
      <BlockedAppsPanel />
      <View style={{ height: 24 }} />
      <SessionStats />
      <Button onPress={() => router.back()} style={{ marginTop: 32 }}>
        Exit focus mode
      </Button>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 52, paddingBottom: 48 },
});
