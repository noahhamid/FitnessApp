import {
  fetchUserProfile,
  type UserProfile,
} from "@/src/features/profile/services/profile.service";
import { api } from "@/src/lib/api";
import {
  requestNutritionGoalsFromGemini,
  type GeminiNutritionProfileInput,
} from "@/src/utils/gemini";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  lime: "#C8F135",
  text: "#F2F2F5",
  muted: "#4A4A58",
  sub: "#7A7A8C",
  border: "#FFFFFF18",
};

type GoalRecommendation = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
};

const PLACEHOLDERS = {
  calories: "2000",
  protein: "150",
  carbs: "200",
  fat: "65",
};

function parsePositiveInt(value: string): number | null {
  const n = Number(value.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export default function NutritionGoalsOnboardingRoute() {
  const params = useLocalSearchParams<{
    weightKg?: string;
    heightCm?: string;
    age?: string;
    goalId?: string;
  }>();
  const queryClient = useQueryClient();
  const pulse = useRef(new Animated.Value(0.8)).current;
  const [isGenerating, setIsGenerating] = useState(true);
  const [manualFallback, setManualFallback] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const cachedProfile = queryClient.getQueryData<UserProfile | null>([
    "user",
    "profile",
  ]);
  const { data: profile } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
    initialData: cachedProfile ?? undefined,
  });
  const profileForGemini = useMemo<GeminiNutritionProfileInput>(() => {
    const parsedWeight = params.weightKg ? Number(params.weightKg) : null;
    const parsedHeight = params.heightCm ? Number(params.heightCm) : null;
    const parsedAge = params.age ? Number(params.age) : null;

    return {
      weightKg:
        parsedWeight != null && Number.isFinite(parsedWeight)
          ? parsedWeight
          : (profile?.weightKg ?? null),
      heightCm:
        parsedHeight != null && Number.isFinite(parsedHeight)
          ? parsedHeight
          : (profile?.heightCm ?? null),
      age:
        parsedAge != null && Number.isFinite(parsedAge)
          ? parsedAge
          : (profile?.age ?? null),
      goalId: params.goalId ?? profile?.goalId ?? "health",
    };
  }, [params.age, params.goalId, params.heightCm, params.weightKg, profile]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.8,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  useEffect(() => {
    let active = true;
    async function generate() {
      if (
        !profileForGemini ||
        (!profileForGemini.weightKg &&
          !profileForGemini.heightCm &&
          !profileForGemini.age)
      ) {
        if (!active) return;
        setManualFallback(true);
        setIsGenerating(false);
        setNote("");
        return;
      }
      setIsGenerating(true);
      try {
        const rec = await requestNutritionGoalsFromGemini(profileForGemini);
        if (!active) return;
        setCalories(String(rec.calories));
        setProtein(String(rec.protein));
        setCarbs(String(rec.carbs));
        setFat(String(rec.fat));
        setNote(rec.note ?? "");
        setManualFallback(false);
      } catch {
        if (!active) return;
        setCalories("");
        setProtein("");
        setCarbs("");
        setFat("");
        setNote("");
        setManualFallback(true);
      } finally {
        if (active) setIsGenerating(false);
      }
    }

    void generate();
    return () => {
      active = false;
    };
  }, [profileForGemini]);

  const canSave = useMemo(() => {
    return (
      parsePositiveInt(calories) !== null &&
      parsePositiveInt(protein) !== null &&
      parsePositiveInt(carbs) !== null &&
      parsePositiveInt(fat) !== null
    );
  }, [calories, protein, carbs, fat]);

  async function handleLooksGood() {
    const cals = parsePositiveInt(calories);
    const pro = parsePositiveInt(protein);
    const car = parsePositiveInt(carbs);
    const fatValue = parsePositiveInt(fat);
    if (cals == null || pro == null || car == null || fatValue == null) return;

    setSaving(true);
    try {
      await api.put("/api/nutrition/goals", {
        calories: cals,
        protein: pro,
        carbs: car,
        fat: fatValue,
      });
      await queryClient.invalidateQueries({ queryKey: ["nutrition", "goals"] });
      router.push({
        pathname: "/(auth)/onboarding/ready",
        params: {
          goalId: params.goalId ?? profileForGemini.goalId ?? undefined,
        },
      });
    } finally {
      setSaving(false);
    }
  }

  function handleSkip() {
    router.push({
      pathname: "/(auth)/onboarding/ready",
      params: { goalId: params.goalId ?? profileForGemini.goalId ?? undefined },
    });
  }

  if (isGenerating) {
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.loadingWrap}>
          <Animated.View
            style={[s.pulseDot, { transform: [{ scale: pulse }] }]}
          />
          <Text style={s.loadingTitle}>Calculating your goals...</Text>
          <ActivityIndicator color={T.lime} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.container}>
        <Text style={s.eyebrow}>AI NUTRITION TARGETS</Text>
        <Text style={s.title}>YOUR DAILY GOALS</Text>
        <Text style={s.subtitle}>
          Review and adjust your personalized nutrition targets.
        </Text>

        <View style={s.card}>
          <View style={s.row}>
            <View style={s.field}>
              <Text style={s.label}>Calories</Text>
              <TextInput
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                placeholder={PLACEHOLDERS.calories}
                placeholderTextColor={T.muted}
                style={s.input}
              />
            </View>
            <View style={s.field}>
              <Text style={s.label}>Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                placeholder={PLACEHOLDERS.protein}
                placeholderTextColor={T.muted}
                style={s.input}
              />
            </View>
          </View>

          <View style={s.row}>
            <View style={s.field}>
              <Text style={s.label}>Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                placeholder={PLACEHOLDERS.carbs}
                placeholderTextColor={T.muted}
                style={s.input}
              />
            </View>
            <View style={s.field}>
              <Text style={s.label}>Fat (g)</Text>
              <TextInput
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                placeholder={PLACEHOLDERS.fat}
                placeholderTextColor={T.muted}
                style={s.input}
              />
            </View>
          </View>

          {manualFallback ? (
            <Text style={s.fallbackText}>
              AI unavailable — set your goals manually.
            </Text>
          ) : note ? (
            <Text style={s.noteText}>{note}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[s.primaryBtn, (!canSave || saving) && s.primaryBtnDisabled]}
          activeOpacity={0.85}
          disabled={!canSave || saving}
          onPress={() => {
            void handleLooksGood();
          }}
        >
          <Text style={s.primaryBtnText}>
            {saving ? "SAVING..." : "LOOKS GOOD"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryBtn}
          activeOpacity={0.8}
          onPress={handleSkip}
        >
          <Text style={s.secondaryBtnText}>SKIP FOR NOW</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.bg0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  pulseDot: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: `${T.lime}22`,
    borderWidth: 1,
    borderColor: `${T.lime}88`,
  },
  loadingTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 32,
    color: T.text,
    letterSpacing: 0.4,
  },
  eyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 2,
    color: T.muted,
    marginBottom: 8,
  },
  title: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 40,
    lineHeight: 42,
    color: T.text,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: T.sub,
    marginBottom: 18,
  },
  card: {
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  field: {
    flex: 1,
  },
  label: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: T.bg0,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: T.lime,
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 26,
    lineHeight: 28,
  },
  noteText: {
    marginTop: 4,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: T.sub,
  },
  fallbackText: {
    marginTop: 4,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: T.muted,
  },
  primaryBtn: {
    marginTop: "auto",
    backgroundColor: T.lime,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
    letterSpacing: 0.7,
    color: T.bg0,
  },
  secondaryBtn: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  secondaryBtnText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.text,
  },
});
