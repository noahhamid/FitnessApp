import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import { C, FONTS, SW } from "@/src/theme";
import { Button } from "@/src/ui/components/Button";
import { ProgressDots } from "@/src/ui/components/ProgressDots";

type Props = { onNext: (goalId: string) => void };

const GOALS = [
  { id: "lose", label: "Lose Weight", icon: "🔥" },
  { id: "build", label: "Build Muscle", icon: "💪" },
  { id: "endure", label: "Endurance", icon: "🏃" },
  { id: "health", label: "Stay Healthy", icon: "❤️" },
];

const CARD_W = (SW - 64 - 12) / 2;

export function GoalsForm({ onNext }: Props) {
  const [goal, setGoal] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.counter}>STEP 1 OF 2</Text>
        <ProgressDots total={2} current={0} />
        <View style={s.goalGrid}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.id}
              onPress={() => setGoal(g.id)}
              style={[s.goalCard, goal === g.id && s.goalCardActive]}
            >
              <Text style={s.goalIcon}>{g.icon}</Text>
              <Text style={[s.goalLabel, goal === g.id && s.goalLabelActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button disabled={!goal} onPress={() => goal && onNext(goal)} style={{ marginTop: 32 }}>
          CONTINUE →
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 32, paddingTop: 52, paddingBottom: 48, flexGrow: 1 },
  counter: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
  },
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  goalCard: {
    width: CARD_W,
    backgroundColor: C.bg3,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 16,
    padding: 20,
  },
  goalCardActive: { borderColor: C.accent, backgroundColor: `${C.accent}18` },
  goalIcon: { fontSize: 28, marginBottom: 8 },
  goalLabel: { fontFamily: FONTS.bold, fontSize: 16, color: C.text },
  goalLabelActive: { color: C.accent },
});
