import { ProgressDots } from "@/src/ui/components/ProgressDots";
import { RulerSlider } from "@/src/ui/components/RulerSlider";
import { HeightSilhouette } from "@/src/ui/components/HeightSilhouette";
import { WeightScale } from "@/src/ui/components/WeightScale";
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

const MIN_KG = 35;
const MAX_KG = 180;
const MIN_CM = 120;
const MAX_CM = 220;

type Gender = "male" | "female";

type Props = {
  onNext: (metrics: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: Gender;
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

function kgToLb(kg: number) {
  return Math.round(kg * 2.20462);
}

// --- Compact input used for age only ---
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
  // weightKg is the source of truth; lbs is a display-only conversion.
  // The ruler itself always scrolls in kg increments.
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(170);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const { mutateAsync: saveProfile, error } = useSaveProfile();

  const canFinish = !!age && !!gender;
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

    try {
      await Promise.all([
        saveProfile({
          goalId: goalId,
          gender: gender!,
          weight_kg: weightKg,
          height_cm: heightCm,
          age: parseInt(age, 10),
          weight_unit: unit,
        }),
        new Promise((r) => setTimeout(r, 800)),
      ]);
      onNext({ weightKg, heightCm, age: parseInt(age, 10), gender: gender! });
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

  const weightDisplay = unit === "kg" ? weightKg : kgToLb(weightKg);

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

          {/* --- GENDER --- */}
          <Text style={s.sectionLabel}>GENDER</Text>
          <View style={[s.segment, { marginBottom: 28 }]}>
            {(["male", "female"] as const).map((g) => (
              <Pressable
                key={g}
                onPress={() => setGender(g)}
                style={[
                  s.segmentTab,
                  gender === g && s.segmentTabActive,
                  { flex: 1 },
                ]}
              >
                <Text
                  style={[s.segmentText, gender === g && s.segmentTextActive]}
                >
                  {g === "male" ? "MALE" : "FEMALE"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* --- WEIGHT --- */}
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionLabel}>WEIGHT</Text>
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

          <View style={s.visualRow}>
            <View style={s.readoutBlock}>
              <View style={s.readoutRow}>
                <Text style={s.readoutNumber}>{weightDisplay}</Text>
                <Text style={s.readoutUnit}>{unit}</Text>
              </View>
            </View>
            <WeightScale
              weightKg={weightKg}
              min={MIN_KG}
              max={MAX_KG}
              size={140}
            />
          </View>

          <RulerSlider
            min={MIN_KG}
            max={MAX_KG}
            step={1}
            value={weightKg}
            onChange={setWeightKg}
            unitLabel="weight in kilograms"
          />

          {/* --- HEIGHT --- */}
          <Text style={[s.sectionLabel, { marginTop: 32 }]}>HEIGHT</Text>

          <View style={s.visualRow}>
            <View style={s.readoutBlock}>
              <View style={s.readoutRow}>
                <Text style={s.readoutNumber}>{heightCm}</Text>
                <Text style={s.readoutUnit}>cm</Text>
              </View>
            </View>
            <HeightSilhouette
              heightCm={heightCm}
              min={MIN_CM}
              max={MAX_CM}
              containerHeight={140}
            />
          </View>

          <RulerSlider
            min={MIN_CM}
            max={MAX_CM}
            step={1}
            value={heightCm}
            onChange={setHeightCm}
            unitLabel="height in centimeters"
          />

          {/* --- AGE --- */}
          <View style={{ marginTop: 32 }}>
            <MetricInput
              label="AGE"
              value={age}
              onChangeText={setAge}
              placeholder="25"
              unit="yrs"
            />
          </View>

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

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionLabel: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
  },

  segment: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 4,
  },
  segmentTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
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

  visualRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  readoutBlock: { flex: 1 },
  readoutRow: { flexDirection: "row", alignItems: "flex-end" },
  readoutNumber: {
    fontFamily: FONTS.black,
    fontSize: 56,
    color: C.accent,
    lineHeight: 56,
  },
  readoutUnit: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: C.muted,
    marginLeft: 6,
    marginBottom: 8,
  },

  // Compact metric input (age only)
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
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  finishBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: C.bg,
    letterSpacing: 1,
  },
});
