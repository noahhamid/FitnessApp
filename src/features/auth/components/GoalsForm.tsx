import { ProgressDots } from "@/src/ui/components/ProgressDots";
import { GoalIcon, GoalIconName } from "@/src/ui/components/GoalIcon";
import { FONTS } from "@/src/ui/tokens";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

const C = {
  bg: "#121212",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#FFC700",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

const GOALS: { id: string; icon: GoalIconName; title: string; desc: string }[] =
  [
    {
      id: "lose",
      icon: "lose",
      title: "Lose Fat",
      desc: "Cut down, stay strong.",
    },
    {
      id: "build",
      icon: "build",
      title: "Build Muscle",
      desc: "Gain size and strength.",
    },
    {
      id: "endure",
      icon: "endure",
      title: "Build Endurance",
      desc: "Push your conditioning.",
    },
    {
      id: "health",
      icon: "health",
      title: "Stay Healthy",
      desc: "Balanced, sustainable fitness.",
    },
  ];

export function GoalsForm() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.counter}>STEP 1 OF 3</Text>
        <ProgressDots total={3} current={0} />
        <Text style={s.headline}>YOUR{"\n"}GOAL.</Text>
        <Text style={s.sub}>What are you training for?</Text>
      </View>

      <View style={s.cards}>
        {GOALS.map((g) => {
          const isSelected = selected === g.id;
          return (
            <Pressable
              key={g.id}
              style={[s.card, isSelected && s.cardSelected]}
              onPress={() => setSelected(g.id)}
            >
              <GoalIcon name={g.icon} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={s.cardTitle}>{g.title}</Text>
                <Text style={s.cardDesc}>{g.desc}</Text>
              </View>
              <View style={[s.radio, isSelected && s.radioSelected]}>
                {isSelected && <View style={s.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <Pressable
        disabled={!selected}
        style={[s.primaryBtn, !selected && s.primaryBtnDisabled]}
        onPress={() =>
          router.push({
            pathname: "/(auth)/onboarding/profile",
            params: { goalId: selected! },
          })
        }
      >
        <Text style={s.primaryBtnText}>CONTINUE →</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 24,
  },
  header: { marginBottom: 28 },
  counter: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  headline: {
    fontFamily: FONTS.black,
    fontSize: 36,
    color: C.text,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  sub: { fontFamily: FONTS.regular, fontSize: 14, color: C.muted },
  cards: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 16,
  },
  cardSelected: { borderColor: C.accent },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: C.text,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  cardDesc: { fontFamily: FONTS.regular, fontSize: 12, color: C.muted },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: C.accent },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.accent,
  },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: C.bg,
    letterSpacing: 1,
  },
});
