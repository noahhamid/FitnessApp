import { useAuth, useSignOut } from "@/src/features/auth/hooks/useAuth";
import {
  fetchUserProfile,
  saveUserProfile,
} from "@/src/features/profile/services/profile.service";
import { api } from "@/src/lib/api";
import { requestNutritionGoalsFromGemini } from "@/src/utils/gemini";
import { Button } from "@/src/ui/components/Button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Align with DashboardScreen design tokens (same hex / hierarchy)
const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  red: "#FF3D3D",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

const GOALS = [
  { id: "lose", label: "Lose" },
  { id: "build", label: "Build" },
  { id: "endure", label: "Endure" },
  { id: "health", label: "Health" },
] as const;

type SaveState = "idle" | "saving" | "saved";
type RecalcState = "idle" | "loading" | "saved";

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export default function ProfileScreen() {
  const { user, isPending: authPending } = useAuth();
  const signOutMutation = useSignOut();
  const qc = useQueryClient();
  const { data: profile, isPending: profilePending } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [goalInput, setGoalInput] = useState<(typeof GOALS)[number]["id"]>("health");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [recalcState, setRecalcState] = useState<RecalcState>("idle");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recalcTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goalLabel = useMemo(() => {
    switch (profile?.goalId) {
      case "lose":
        return "Lose Weight";
      case "build":
        return "Build Muscle";
      case "endure":
        return "Endurance";
      case "health":
        return "Stay Healthy";
      default:
        return "—";
    }
  }, [profile?.goalId]);

  const loading = authPending || profilePending;
  const name = user?.name?.trim() || "Athlete";
  const email = user?.email?.trim() || "—";

  const weightKg =
    typeof profile?.weightKg === "number" && Number.isFinite(profile.weightKg)
      ? profile.weightKg
      : 0;
  const heightCm =
    typeof profile?.heightCm === "number" &&
    Number.isFinite(profile.heightCm)
      ? profile.heightCm
      : 0;
  const ageYears =
    typeof profile?.age === "number" && Number.isFinite(profile.age)
      ? profile.age
      : 0;

  useEffect(() => {
    if (editMode) return;
    setNameInput(name);
    setWeightInput(weightKg > 0 ? String(Number(weightKg.toFixed(2))) : "");
    setHeightInput(heightCm > 0 ? String(heightCm) : "");
    setAgeInput(ageYears > 0 ? String(ageYears) : "");
    setGoalInput(
      profile?.goalId === "lose" ||
        profile?.goalId === "build" ||
        profile?.goalId === "endure" ||
        profile?.goalId === "health"
        ? profile.goalId
        : "health",
    );
  }, [ageYears, editMode, heightCm, name, profile?.goalId, weightKg]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (recalcTimeoutRef.current) clearTimeout(recalcTimeoutRef.current);
    };
  }, []);

  async function handleSaveProfile() {
    const nextName = nameInput.trim();
    const nextWeight = parsePositiveNumber(weightInput);
    const nextHeight = parsePositiveNumber(heightInput);
    const nextAge = parsePositiveNumber(ageInput);

    if (!nextName) {
      Alert.alert("Invalid name", "Please enter a valid name.");
      return;
    }

    if (!nextWeight || !nextHeight || !nextAge) {
      Alert.alert("Invalid profile", "Weight, height, and age must be valid numbers.");
      return;
    }

    setSaveState("saving");
    try {
      await saveUserProfile({
        name: nextName,
        goalId: goalInput,
        weightKg: Number(nextWeight.toFixed(2)),
        heightCm: Math.round(nextHeight),
        age: Math.round(nextAge),
      });

      await qc.invalidateQueries({ queryKey: ["auth", "session"] });

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["user", "profile"] }),
        qc.invalidateQueries({ queryKey: ["nutrition", "goals"] }),
      ]);

      setSaveState("saved");
      saveTimeoutRef.current = setTimeout(() => {
        setSaveState("idle");
        setEditMode(false);
      }, 1500);
    } catch (err) {
      setSaveState("idle");
      Alert.alert(
        "Save failed",
        err instanceof Error ? err.message : "Unable to save profile changes.",
      );
    }
  }

  async function handleRecalculateGoals() {
    const sourceWeight = editMode ? parsePositiveNumber(weightInput) : weightKg || null;
    const sourceHeight = editMode ? parsePositiveNumber(heightInput) : heightCm || null;
    const sourceAge = editMode ? parsePositiveNumber(ageInput) : ageYears || null;
    const sourceGoal = editMode ? goalInput : profile?.goalId ?? "health";

    if (!sourceWeight && !sourceHeight && !sourceAge) {
      Alert.alert(
        "Missing profile data",
        "Add your weight, height, and age before recalculating goals.",
      );
      return;
    }

    setRecalcState("loading");
    try {
      const result = await requestNutritionGoalsFromGemini({
        weightKg: sourceWeight ? Number(sourceWeight.toFixed(2)) : null,
        heightCm: sourceHeight ? Math.round(sourceHeight) : null,
        age: sourceAge ? Math.round(sourceAge) : null,
        goalId: sourceGoal,
      });

      await api.put("/api/nutrition/goals", {
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
      });

      await qc.invalidateQueries({ queryKey: ["nutrition", "goals"] });
      setRecalcState("saved");
      recalcTimeoutRef.current = setTimeout(() => {
        setRecalcState("idle");
      }, 1500);
    } catch (err) {
      setRecalcState("idle");
      Alert.alert(
        "Recalculation failed",
        err instanceof Error
          ? err.message
          : "Could not update nutrition goals with AI.",
      );
    }
  }

  const weightDisplay = weightKg > 0 ? `${weightKg} kg` : "—";
  const heightDisplay = heightCm > 0 ? `${heightCm} cm` : "—";
  const ageDisplay = ageYears > 0 ? String(ageYears) : "—";

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg0} />
      <ScrollView
        contentContainerStyle={s.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.loader}>
            <ActivityIndicator color={T.lime} />
          </View>
        ) : null}

        <View style={s.topRow}>
          <Text style={s.pageTitle}>My Profile</Text>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => {
              if (editMode) {
                void handleSaveProfile();
              } else {
                setEditMode(true);
              }
            }}
            disabled={saveState === "saving"}
          >
            {saveState === "saved" ? (
              <Text style={s.savedText}>Saved ✓</Text>
            ) : (
              <Ionicons
                name={editMode ? "checkmark-done" : "create-outline"}
                size={18}
                color={T.lime}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.cardTitleRow}>
              <Ionicons name="body-outline" size={14} color={T.lime} />
              <Text style={s.cardTitle}>BODY PROFILE</Text>
            </View>
          </View>
          <View style={s.metricDivider} />

          <Text style={s.metricLabel}>Name</Text>
          {editMode ? (
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={T.muted}
              style={s.input}
            />
          ) : (
            <Text style={s.valueText}>{name}</Text>
          )}

          <Text style={s.metricLabel}>Email</Text>
          <Text style={s.readonlyEmail}>{email}</Text>

          <Text style={s.metricLabel}>Weight (kg)</Text>
          {editMode ? (
            <TextInput
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              placeholder="75"
              placeholderTextColor={T.muted}
              style={s.input}
            />
          ) : (
            <Text style={s.valueText}>{weightDisplay}</Text>
          )}

          <Text style={s.metricLabel}>Height (cm)</Text>
          {editMode ? (
            <TextInput
              value={heightInput}
              onChangeText={setHeightInput}
              keyboardType="number-pad"
              placeholder="175"
              placeholderTextColor={T.muted}
              style={s.input}
            />
          ) : (
            <Text style={s.valueText}>{heightDisplay}</Text>
          )}

          <Text style={s.metricLabel}>Age</Text>
          {editMode ? (
            <TextInput
              value={ageInput}
              onChangeText={setAgeInput}
              keyboardType="number-pad"
              placeholder="25"
              placeholderTextColor={T.muted}
              style={s.input}
            />
          ) : (
            <Text style={s.valueText}>{ageDisplay}</Text>
          )}

          <Text style={s.metricLabel}>Goal</Text>
          {editMode ? (
            <View style={s.goalChips}>
              {GOALS.map((goal) => {
                const selected = goalInput === goal.id;
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[s.goalChip, selected && s.goalChipSelected]}
                    onPress={() => setGoalInput(goal.id)}
                  >
                    <Text
                      style={[s.goalChipText, selected && s.goalChipTextSelected]}
                    >
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={s.valueText}>{goalLabel}</Text>
          )}

          {!profile && !profilePending ? (
            <Text style={s.hint}>
              Add metrics during onboarding to personalize your plan.
            </Text>
          ) : null}
        </View>

        <Button
          onPress={() => {
            void handleRecalculateGoals();
          }}
          disabled={recalcState === "loading"}
          style={s.recalcBtn}
        >
          {recalcState === "loading"
            ? "Recalculating..."
            : recalcState === "saved"
              ? "Goals updated ✓"
              : "Recalculate nutrition goals with AI"}
        </Button>

        <TouchableOpacity
          onPress={() => signOutMutation.mutate()}
          activeOpacity={0.8}
          style={s.signOutBtn}
        >
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.bg0,
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
  },
  inner: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: 32,
  },
  loader: {
    marginBottom: 12,
    alignItems: "flex-start",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 38,
    color: T.text,
    letterSpacing: 0.4,
  },
  iconBtn: {
    minHeight: 34,
    minWidth: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.borderMid,
    backgroundColor: T.bg2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  savedText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.lime,
  },
  card: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.borderMid,
    padding: 18,
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 4,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.text,
    letterSpacing: 1.0,
  },
  metricDivider: {
    height: 1,
    backgroundColor: T.border,
    marginVertical: 12,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  metricLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.muted,
    marginTop: 8,
    marginBottom: 6,
  },
  valueText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 24,
    color: T.lime,
    marginBottom: 2,
  },
  readonlyEmail: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.sub,
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: T.borderMid,
    backgroundColor: T.bg2,
    color: T.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    marginBottom: 2,
  },
  goalChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  goalChip: {
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 20,
    backgroundColor: T.bg2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  goalChipSelected: {
    backgroundColor: `${T.lime}22`,
    borderColor: `${T.lime}66`,
  },
  goalChipText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
  },
  goalChipTextSelected: {
    color: T.lime,
  },
  hint: {
    marginTop: 10,
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    lineHeight: 16,
  },
  recalcBtn: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: T.lime,
  },
  signOutBtn: {
    marginTop: 8,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderColor: T.borderMid,
    borderWidth: 1,
    backgroundColor: T.bg3,
  },
  signOutText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: T.red,
  },
});
