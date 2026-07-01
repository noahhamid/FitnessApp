import { ProgressDots } from "@/src/ui/components/ProgressDots";
import { FONTS } from "@/src/ui/tokens";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSaveGoal } from "../hooks/useGoals";
import type { GoalId } from "../services/goals.service";

const { width: SW } = Dimensions.get("window");

const C = {
  bg: "#121212",
  bg2: "#181818",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#FFC700",
  accentDim: "rgba(255, 199, 0, 0.12)",
  accentGlow: "rgba(255, 199, 0, 0.35)",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

type Props = { onNext: (goalId: string) => void };

const GOALS: { id: GoalId; label: string; sub: string; icon: string }[] = [
  {
    id: "lose",
    label: "Lose Weight",
    sub: "Burn fat, cut calories",
    icon: "🔥",
  },
  {
    id: "build",
    label: "Build Muscle",
    sub: "Strength & hypertrophy",
    icon: "💪",
  },
  { id: "endure", label: "Endurance", sub: "Cardio & stamina", icon: "🏃" },
  {
    id: "health",
    label: "Stay Healthy",
    sub: "Balanced lifestyle",
    icon: "❤️",
  },
];

const CARD_W = (SW - 64 - 12) / 2;

// --- Animated card wrapper ---
// IMPORTANT: `scale` (transform, native driver) and `glow` (border/bg/shadow,
// JS driver) must live on TWO SEPARATE Animated.View nodes. Putting both a
// native-driven transform and a JS-driven color/shadow animation on the same
// Animated.View is what throws "Attempting to run JS driven animation on
// animated node that has been moved to 'native'".
// --- Animated card: one shared driver for all color/border transitions ---
function GoalCard({
  goal,
  selected,
  onPress,
}: {
  goal: (typeof GOALS)[number];
  selected: boolean;
  onPress: () => void;
}) {
  const press = useRef(new Animated.Value(1)).current; // native: press scale only
  const select = useRef(new Animated.Value(selected ? 1 : 0)).current; // JS: every color/border

  useEffect(() => {
    Animated.spring(select, {
      toValue: selected ? 1 : 0,
      speed: 18,
      bounciness: 6,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const pressIn = () =>
    Animated.spring(press, {
      toValue: 0.96,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  const pressOut = () =>
    Animated.spring(press, {
      toValue: 1,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  // Card
  const cardBorder = select.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.accent],
  });
  const cardBg = select.interpolate({
    inputRange: [0, 1],
    outputRange: [C.card, C.accentDim],
  });
  const shadowOpacity = select.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.55],
  });

  // Icon badge — now rides the SAME driver, so it moves in lockstep with the card
  const iconBg = select.interpolate({
    inputRange: [0, 1],
    outputRange: [C.bg2, "rgba(255, 199, 0, 0.14)"],
  });
  const iconBorder = select.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.accent],
  });

  // Label color
  const labelColor = select.interpolate({
    inputRange: [0, 1],
    outputRange: [C.text, C.accent],
  });

  // Check dot: scale in rather than hard-appear
  const dotScale = select.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={{ transform: [{ scale: press }] }}>
        <Animated.View
          style={[
            s.goalCard,
            {
              borderColor: cardBorder,
              backgroundColor: cardBg,
              shadowColor: C.accent,
              shadowOpacity,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        >
          <Animated.View
            style={[
              s.iconWrap,
              { backgroundColor: iconBg, borderColor: iconBorder },
            ]}
          >
            <Text style={s.goalIcon}>{goal.icon}</Text>
          </Animated.View>

          <Animated.Text style={[s.goalLabel, { color: labelColor }]}>
            {goal.label}
          </Animated.Text>
          <Text style={s.goalSub}>{goal.sub}</Text>

          <Animated.View
            style={[s.checkDot, { transform: [{ scale: dotScale }] }]}
          >
            <View style={s.checkDotInner} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

export function GoalsForm({ onNext }: Props) {
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const { mutateAsync: saveGoal, error } = useSaveGoal();

  // btnScale is the ONLY animated value on this view, ONLY drives transform —
  // no conflict, no split needed here.
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, []),
  );

  async function handleContinue() {
    if (!goal) return;
    setLoading(true);
    try {
      await Promise.all([
        saveGoal(goal),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
      onNext(goal);
    } catch {
      if (mountedRef.current) setLoading(false);
    }
  }

  const btnPressIn = () =>
    Animated.spring(btnScale, {
      toValue: 0.97,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  const btnPressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text style={s.counter}>STEP 1 OF 2</Text>
          <ProgressDots total={2} current={0} />
          <Text style={s.headline}>WHAT'S YOUR{"\n"}MAIN GOAL?</Text>
          <Text style={s.sub}>
            We'll tailor your plan around this. You can always change it later.
          </Text>
        </View>

        <View style={s.goalGrid}>
          {GOALS.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              selected={goal === g.id}
              onPress={() => setGoal(g.id)}
            />
          ))}
        </View>

        {error && (
          <Text style={s.errorText}>
            Failed to save goal. Please try again.
          </Text>
        )}
      </ScrollView>

      <View style={s.bottomBar}>
        <Pressable
          disabled={!goal || loading}
          onPress={handleContinue}
          onPressIn={btnPressIn}
          onPressOut={btnPressOut}
        >
          <Animated.View
            style={[
              s.continueBtn,
              (!goal || loading) && s.continueBtnDisabled,
              { transform: [{ scale: btnScale }] },
            ]}
          >
            {loading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color={C.bg} size="small" />
                <Text style={s.continueBtnText}>Saving...</Text>
              </View>
            ) : (
              <Text style={s.continueBtnText}>CONTINUE →</Text>
            )}
          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 140,
    flexGrow: 1,
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
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: C.muted,
    lineHeight: 21,
  },
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  goalCard: {
    width: CARD_W,
    borderWidth: 1.5,
    borderRadius: 22,
    padding: 20,
    position: "relative",
    minHeight: 156,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.bg2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  iconWrapActive: {
    backgroundColor: "rgba(255, 199, 0, 0.14)",
    borderColor: C.accent,
  },
  goalIcon: { fontSize: 26 },
  goalLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: C.text,
    marginBottom: 4,
  },
  goalLabelActive: { color: C.accent },
  goalSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
    lineHeight: 16,
  },
  checkDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.accent,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  checkDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.bg,
  },
  errorText: {
    color: "#FF5C5C",
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
    fontFamily: FONTS.regular,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  continueBtn: {
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.accent,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  continueBtnDisabled: { opacity: 0.35, shadowOpacity: 0 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  continueBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: C.bg,
    letterSpacing: 1,
  },
});
