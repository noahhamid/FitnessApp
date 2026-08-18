import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import {
  HorizontalWeightScale,
  type HorizontalWeightScaleHandle,
} from "@/src/ui/components/HorizontalWeightScale";
import { FONTS, useOnboardingColors, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_KG = 0;
const MAX_KG = 600;

/** Adult average starting weights — dial opens with this value under the pointer. */
const WEIGHT_BY_GENDER: Record<"male" | "female", { default: number }> = {
  male: { default: 78 },
  female: { default: 65 },
};

type BmiBand = {
  label: string;
  range: string;
  color: string;
};

function clampKg(n: number) {
  return Math.max(MIN_KG, Math.min(MAX_KG, Math.round(n)));
}

function computeBmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  if (m <= 0) return 0;
  return weightKg / (m * m);
}

function bmiBand(bmi: number): BmiBand {
  if (bmi < 18.5) {
    return {
      label: "Underweight",
      range: "Below 18.5",
      color: "#2B6CB0",
    };
  }
  if (bmi < 25) {
    return {
      label: "Healthy",
      range: "18.5 – 24.9",
      color: "#4CAF50",
    };
  }
  if (bmi < 30) {
    return {
      label: "Overweight",
      range: "25 – 29.9",
      color: "#E53935",
    };
  }
  return {
    label: "Obese",
    range: "30+",
    color: "#E53935",
  };
}

export default function OnboardingWeightScreen() {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);

  const params = useLocalSearchParams<{
    heightCm?: string;
    weightKg?: string;
    gender?: string;
    age?: string;
    goalId?: string;
    /** Present when restoring draft / navigating back from a later step. */
    weightKg?: string;
  }>();
  const gender = params.gender === "female" ? "female" : "male";
  const defaultKg = WEIGHT_BY_GENDER[gender].default;

  const heightCm = useMemo(() => {
    const parsed = parseInt(String(params.heightCm ?? ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 170;
  }, [params.heightCm]);

  const age = useMemo(() => {
    const parsed = parseInt(String(params.age ?? ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }, [params.age]);

  const savedWeight = parseInt(String(params.weightKg ?? ""), 10);
  const hasSavedWeight = Number.isFinite(savedWeight);
  const [weightKg, setWeightKg] = useState<number>(
    hasSavedWeight ? clampKg(savedWeight) : defaultKg,
  );
  const [chosen, setChosen] = useState(hasSavedWeight);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    String(hasSavedWeight ? clampKg(savedWeight) : defaultKg),
  );

  const scaleRef = useRef<HorizontalWeightScaleHandle>(null);
  const inputRef = useRef<TextInput>(null);

  const bmi = computeBmi(weightKg, heightCm);
  const band = bmiBand(bmi);

  const commitDraft = () => {
    const parsed = parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(weightKg));
      setEditing(false);
      return;
    }
    const next = clampKg(parsed);
    setWeightKg(next);
    setDraft(String(next));
    setChosen(true);
    setEditing(false);
    scaleRef.current?.scrollToValue(next);
  };

  const startEditing = () => {
    setDraft(String(weightKg));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleWeightChange = (next: number) => {
    setWeightKg(next);
    setChosen(true);
  };

  const handleNext = () => {
    if (!chosen) return;
    const nextParams = {
      ...params,
      weightKg: String(weightKg),
      heightCm: String(heightCm),
      gender,
      ...(age != null ? { age: String(age) } : {}),
    };

    router.push({
      pathname: "/(auth)/onboarding/body-fat",
      params: nextParams,
    });
  };

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <OnboardingHeader
          headline={"YOUR\nWEIGHT."}
          sub="Slide the line horizontally — or tap the box to type."
          onBack={() => router.back()}
        />

        <View style={s.body}>
          <Pressable
            onPress={startEditing}
            accessibilityRole="button"
            accessibilityLabel="Edit weight"
            style={[s.readout, editing && s.readoutActive]}
          >
            {editing ? (
              <View style={s.readoutRow}>
                <TextInput
                  ref={inputRef}
                  value={draft}
                  onChangeText={(t) =>
                    setDraft(t.replace(/[^0-9]/g, "").slice(0, 3))
                  }
                  onBlur={commitDraft}
                  onSubmitEditing={commitDraft}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  maxLength={3}
                  style={s.readoutInput}
                  selectionColor={C.accent}
                  autoFocus
                />
                <Text style={s.readoutUnit}>kg</Text>
              </View>
            ) : (
              <View style={s.readoutRow}>
                <Text style={s.readoutNumber}>{weightKg}</Text>
                <Text style={s.readoutUnit}>kg</Text>
              </View>
            )}
            <Text style={s.readoutHint}>TAP TO EDIT</Text>
          </Pressable>

          <View style={s.scaleSection}>
            <HorizontalWeightScale
              key={gender}
              ref={scaleRef}
              min={MIN_KG}
              max={MAX_KG}
              value={weightKg}
              onChange={handleWeightChange}
            />
          </View>

          <View style={s.bmiCard}>
            <Text style={s.bmiLabel}>YOUR BMI IS</Text>
            <Text style={s.bmiValue}>{bmi.toFixed(1)}</Text>
            <View style={s.bmiBandRow}>
              <View style={[s.bmiDot, { backgroundColor: band.color }]} />
              <Text style={[s.bmiBand, { color: band.color }]}>{band.label}</Text>
              <Text style={s.bmiRange}>{band.range}</Text>
            </View>
            <Text style={s.bmiNote}>
              Based on {heightCm} cm · {weightKg} kg
            </Text>
          </View>
        </View>

        <OnboardingNav nextDisabled={!chosen} onNext={handleNext} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
  safe: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: "space-between",
    position: "relative",
  },
  flex: {
    flex: 1,
    justifyContent: "space-between",
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 26,
    zIndex: 1,
  },
  readout: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 160,
    borderRadius: 14,
    backgroundColor: C.bg3,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  scaleSection: {
    width: "100%",
    marginVertical: 22,
  },
  readoutRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  readoutNumber: {
    fontFamily: FONTS.extraBold,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.5,
    color: C.text,
  },
  readoutInput: {
    fontFamily: FONTS.extraBold,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.5,
    color: C.accent,
    minWidth: 88,
    padding: 0,
    margin: 0,
    textAlign: "center",
  },
  readoutUnit: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 6,
  },
  readoutHint: {
    marginTop: 6,
    fontFamily: FONTS.bold,
    fontSize: 9,
    letterSpacing: 2,
    color: C.muted2,
  },
  readoutActive: {
    borderColor: C.accent,
  },
  bmiCard: {
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: C.bg3,
    width: "100%",
    maxWidth: 340,
  },
  bmiLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 2,
    color: C.muted,
  },
  bmiValue: {
    marginTop: 4,
    fontFamily: FONTS.extraBold,
    fontSize: 40,
    letterSpacing: -1,
    color: C.text,
  },
  bmiBandRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bmiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bmiBand: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  bmiRange: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
  },
  bmiNote: {
    marginTop: 8,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted2,
  },
});
}

