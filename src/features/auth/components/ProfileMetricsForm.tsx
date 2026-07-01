import { ProgressDots } from "@/src/ui/components/ProgressDots";
import { FONTS } from "@/src/ui/tokens";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSaveProfile } from "../hooks/useProfile";

// --- Muscle Monster theme tokens ---
// Move into src/ui/tokens.ts and export as `C` for app-wide reuse;
// kept local here so this file is drop-in ready.
const C = {
  bg: "#121212",
  bg2: "#181818",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#FFC700",
  accentDim: "rgba(255, 199, 0, 0.10)",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

type Props = {
  onNext: (metrics: {
    weightKg: number;
    heightCm: number;
    age: number;
  }) => void;
  onBack: () => void;
  goalId?: string;
};

const GOAL_COPY: Record<string, string> = {
  lose: "We need your stats to calculate your deficit.",
  build: "We need your stats to set your protein targets.",
  endure: "We need your stats to calibrate your cardio zones.",
  health: "We need your stats to build your balanced plan.",
};

// --- Premium metric input: borderless dark block, gold focus ring, inline unit ---
function MetricInput({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  keyboardType = "numeric",
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  unit?: string;
  keyboardType?: "numeric" | "default";
}) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", C.accent],
  });

  return (
    <View style={s.metricWrap}>
      <Text style={s.metricLabel}>{label}</Text>
      <Animated.View style={[s.metricBox, { borderColor }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={s.metricInput}
          selectionColor={C.accent}
        />
        {unit && <Text style={s.metricUnit}>{unit}</Text>}
      </Animated.View>
    </View>
  );
}

export function ProfileMetricsForm({ onNext, onBack, goalId }: Props) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const { mutateAsync: saveProfile, error } = useSaveProfile();

  const canFinish = !!(weight && height && age);
  const subCopy = goalId
    ? GOAL_COPY[goalId]
    : "We need your stats to personalise your plan.";

  const finishScale = useRef(new Animated.Value(1)).current;

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

  async function handleFinish() {
    if (!canFinish) return;
    setLoading(true);

    const rawWeight = parseFloat(weight);
    const weight_kg =
      unit === "lbs" ? +(rawWeight / 2.205).toFixed(2) : rawWeight;

    try {
      await Promise.all([
        saveProfile({
          weight_kg,
          height_cm: parseFloat(height),
          age: parseInt(age, 10),
          weight_unit: unit,
        }),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
      onNext({
        weightKg: weight_kg,
        heightCm: parseFloat(height),
        age: parseInt(age, 10),
      });
    } catch {
      if (mountedRef.current) setLoading(false);
    }
  }

  const pressIn = (v: Animated.Value) =>
    Animated.spring(v, {
      toValue: 0.97,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  const pressOut = (v: Animated.Value) =>
    Animated.spring(v, {
      toValue: 1,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <Text style={s.counter}>STEP 2 OF 2</Text>
            <ProgressDots total={2} current={1} />
            <Text style={s.headline}>YOUR{"\n"}STATS.</Text>
            <Text style={s.sub}>{subCopy}</Text>
          </View>

          <View style={s.unitRow}>
            <Text style={s.unitLabel}>UNIT</Text>
            <View style={s.segment}>
              {(["kg", "lbs"] as const).map((u) => (
                <Pressable
                  key={u}
                  onPress={() => setUnit(u)}
                  style={[s.segmentTab, unit === u && s.segmentTabActive]}
                >
                  <Text
                    style={[s.segmentText, unit === u && s.segmentTextActive]}
                  >
                    {u.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <MetricInput
            label={`WEIGHT`}
            value={weight}
            onChangeText={setWeight}
            placeholder={unit === "kg" ? "75" : "165"}
            unit={unit}
          />
          <MetricInput
            label="HEIGHT"
            value={height}
            onChangeText={setHeight}
            placeholder="175"
            unit="cm"
          />
          <MetricInput
            label="AGE"
            value={age}
            onChangeText={setAge}
            placeholder="25"
            unit="yrs"
          />

          <Text style={s.privacy}>
            Your data is stored securely and never shared.
          </Text>

          {error && (
            <Text style={s.errorText}>
              Failed to save your stats. Please try again.
            </Text>
          )}

          <View style={s.nav}>
            <Pressable style={s.backBtn} onPress={onBack} disabled={loading}>
              <Text style={s.backText}>← BACK</Text>
            </Pressable>

            <Pressable
              disabled={!canFinish || loading}
              onPress={handleFinish}
              onPressIn={() => pressIn(finishScale)}
              onPressOut={() => pressOut(finishScale)}
              style={{ flex: 2 }}
            >
              <Animated.View
                style={[
                  s.finishBtn,
                  (!canFinish || loading) && s.finishBtnDisabled,
                  { transform: [{ scale: finishScale }] },
                ]}
              >
                {loading ? (
                  <View style={s.loadingRow}>
                    <ActivityIndicator color={C.bg} size="small" />
                    <Text style={s.finishBtnText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={s.finishBtnText}>CALCULATE MY PLAN →</Text>
                )}
              </Animated.View>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 48,
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

  // Unit row (top toggle)
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  unitLabel: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
  },

  // Shared segmented control (used for unit toggle; reuse for gender picker)
  segment: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentTabActive: { backgroundColor: C.accent },
  segmentText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: C.muted,
  },
  segmentTextActive: { color: C.bg },

  // Premium metric input blocks
  metricWrap: { marginBottom: 16 },
  metricLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.muted,
    marginBottom: 8,
  },
  metricBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  metricInput: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: C.text,
    padding: 0,
  },
  metricUnit: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: C.muted,
    letterSpacing: 0.5,
    marginLeft: 12,
  },

  privacy: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
    opacity: 0.6,
  },
  errorText: {
    color: "#FF5C5C",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    fontFamily: FONTS.regular,
  },

  nav: { flexDirection: "row", marginTop: 24, gap: 12 },
  backBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: C.text,
    letterSpacing: 0.8,
  },
  finishBtn: {
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
  finishBtnDisabled: { opacity: 0.35, shadowOpacity: 0 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  finishBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: C.bg,
    letterSpacing: 1,
  },
});
