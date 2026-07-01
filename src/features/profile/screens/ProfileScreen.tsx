import { useAuth, useSignOut } from "@/src/features/auth/hooks/useAuth";
import {
  fetchUserProfile,
  saveUserProfile,
} from "@/src/features/profile/services/profile.service";
import { fetchWorkoutHistory } from "@/src/features/workout/services/workout.service";
import { api } from "@/src/lib/api";
import { calculateNutritionGoals } from "@/src/utils/nutritionCalculator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#121212",
  card: "#1E1E1E",
  surface: "#262626", // inputs / chips resting state
  gold: "#FFC700",
  red: "#FF5C5C", // only ever shown on press for destructive actions
  text: "#FFFFFF",
  sub: "#A0A0A0",
  border: "#FFFFFF0D",
};

// ─── Fitness goals ────────────────────────────────────────────────────────────
const GOALS = [
  { id: "lose", label: "Lose Weight", icon: "trending-down-outline" as const },
  { id: "build", label: "Build Muscle", icon: "barbell-outline" as const },
  { id: "endure", label: "Endurance", icon: "heart-outline" as const },
  { id: "health", label: "Stay Healthy", icon: "leaf-outline" as const },
] as const;

type GoalId = (typeof GOALS)[number]["id"];
type SaveState = "idle" | "saving" | "saved";

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

// ─── Settings row data ────────────────────────────────────────────────────────
const SETTINGS = [
  {
    id: "body",
    label: "Body & Health",
    sub: "Weight · Height · Age",
    icon: "body-outline" as const,
  },
  {
    id: "goal",
    label: "Fitness Goal",
    sub: null,
    icon: "trending-up-outline" as const,
  },
  {
    id: "account",
    label: "Account Info",
    sub: null,
    icon: "person-outline" as const,
  },
  {
    id: "help",
    label: "Help & Support",
    sub: "FAQ · Contact us",
    icon: "help-circle-outline" as const,
  },
];

// ─── Compact metric mini (right-column of avatar card) ───────────────────────
function MetricMini({
  value,
  unit,
  accent,
}: {
  value: string | number;
  unit: string;
  accent?: boolean;
}) {
  return (
    <View style={s.metricMini}>
      <Text style={[s.metricMiniValue, accent && { color: T.gold }]}>
        {value}
      </Text>
      <Text style={s.metricMiniUnit}>{unit}</Text>
    </View>
  );
}

// ─── Sign out button with press-only red accent ──────────────────────────────
function SignOutButton({
  onConfirm,
  pending,
}: {
  onConfirm: () => void;
  pending: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const tint = pressed ? T.red : T.sub;

  return (
    <TouchableOpacity
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onConfirm}
      activeOpacity={0.85}
      style={[s.signOutBtn, pressed && s.signOutBtnPressed]}
    >
      {pending ? (
        <ActivityIndicator size="small" color={tint} />
      ) : (
        <>
          <Ionicons name="log-out-outline" size={16} color={tint} />
          <Text style={[s.signOutText, { color: tint }]}>Sign Out</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, isPending: authPending } = useAuth();
  const signOutMutation = useSignOut();
  const qc = useQueryClient();

  const { data: profile, isPending: profilePending } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });

  const { data: historyRows = [] } = useQuery({
    queryKey: ["workouts", "history", "list"] as const,
    queryFn: () => fetchWorkoutHistory(20),
  });

  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [goalInput, setGoalInput] = useState<GoalId>("health");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loading = authPending || profilePending;
  const name = user?.name?.trim() || "Athlete";
  const email = user?.email?.trim() || "—";
  const weightKg =
    typeof profile?.weightKg === "number" && Number.isFinite(profile.weightKg)
      ? profile.weightKg
      : 0;
  const heightCm =
    typeof profile?.heightCm === "number" && Number.isFinite(profile.heightCm)
      ? profile.heightCm
      : 0;
  const ageYears =
    typeof profile?.age === "number" && Number.isFinite(profile.age)
      ? profile.age
      : 0;
  const activeGoal = GOALS.find((g) => g.id === profile?.goalId) ?? GOALS[3];
  const initials = (user?.name?.trim() ?? "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bmi =
    weightKg > 0 && heightCm > 0
      ? (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1)
      : null;

  const streakDays = historyRows.length;
  const thisWeek = Math.min(
    historyRows.filter((h) =>
      /^(Today|Yesterday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test(h.date),
    ).length,
    7,
  );

  useEffect(() => {
    if (editMode) return;
    setNameInput(name);
    setWeightInput(weightKg > 0 ? String(Number(weightKg.toFixed(2))) : "");
    setHeightInput(heightCm > 0 ? String(heightCm) : "");
    setAgeInput(ageYears > 0 ? String(ageYears) : "");
    setGoalInput(
      (["lose", "build", "endure", "health"] as GoalId[]).includes(
        profile?.goalId as GoalId,
      )
        ? (profile!.goalId as GoalId)
        : "health",
    );
  }, [ageYears, editMode, heightCm, name, profile?.goalId, weightKg]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
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
      Alert.alert(
        "Incomplete profile",
        "Weight, height, and age must be valid numbers.",
      );
      return;
    }

    const savedWeight = Number(nextWeight.toFixed(2));
    const savedHeight = Math.round(nextHeight);
    const savedAge = Math.round(nextAge);

    setSaveState("saving");
    try {
      await saveUserProfile({
        name: nextName,
        goalId: goalInput,
        weightKg: savedWeight,
        heightCm: savedHeight,
        age: savedAge,
      });
      await qc.invalidateQueries({ queryKey: ["auth", "session"] });
      await qc.invalidateQueries({ queryKey: ["user", "profile"] });
      setSaveState("saved");
      saveTimeoutRef.current = setTimeout(() => {
        setSaveState("idle");
        setEditMode(false);
      }, 1400);

      void (async () => {
        try {
          const result = calculateNutritionGoals({
            weightKg: savedWeight,
            heightCm: savedHeight,
            age: savedAge,
            goalId: goalInput,
          });
          await api.put("/api/nutrition/goals", {
            calories: result.calories,
            protein: result.protein,
            carbs: result.carbs,
            fat: result.fat,
          });
          await qc.invalidateQueries({ queryKey: ["nutrition", "goals"] });
        } catch (err) {
          console.error("[profile] background nutrition update failed:", err);
        }
      })();
    } catch (err) {
      setSaveState("idle");
      Alert.alert(
        "Save failed",
        err instanceof Error ? err.message : "Unable to save profile.",
      );
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={T.bg}
        translucent={false}
      />
      <View style={s.screen}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ══════════════════════════════════════════════════════════════
              1. PREMIUM HEADER
          ══════════════════════════════════════════════════════════════ */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.headerLabelRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={11}
                  color={T.sub}
                />
                <Text style={s.headerLabelText}>ATHLETE PROFILE</Text>
              </View>
              <Text style={s.headerGreeting}>Manage your account,</Text>
              <Text style={s.headerHero}>ACCOUNT.</Text>
            </View>

            {/* Edit / Save button */}
            <TouchableOpacity
              style={[s.editBtn, editMode && s.editBtnActive]}
              onPress={() =>
                editMode ? void handleSaveProfile() : setEditMode(true)
              }
              disabled={saveState === "saving"}
              activeOpacity={0.8}
            >
              {saveState === "saving" ? (
                <ActivityIndicator
                  size="small"
                  color={T.bg}
                  style={{ width: 40 }}
                />
              ) : saveState === "saved" ? (
                <>
                  <Ionicons name="checkmark" size={13} color={T.bg} />
                  <Text style={s.editBtnActiveText}>Saved</Text>
                </>
              ) : editMode ? (
                <>
                  <Ionicons name="checkmark" size={13} color={T.bg} />
                  <Text style={s.editBtnActiveText}>Save</Text>
                </>
              ) : (
                <>
                  <Ionicons name="pencil-outline" size={12} color={T.gold} />
                  <Text style={s.editBtnText}>Edit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={{ paddingBottom: 8, paddingLeft: 16 }}>
              <ActivityIndicator color={T.gold} size="small" />
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════
              2. AVATAR + BIOMETRICS CARD (horizontal)
          ══════════════════════════════════════════════════════════════ */}
          <View style={s.userCard}>
            {/* Left: sharp avatar container, gold ring */}
            <View style={s.avatarRing}>
              <View style={s.avatar}>
                <Text style={s.initials}>{initials}</Text>
              </View>
            </View>

            {/* Center: name + tier + email */}
            <View style={s.userInfo}>
              <Text style={s.userName} numberOfLines={1}>
                {name}
              </Text>
              <View style={s.memberBadge}>
                <Text style={s.memberText}>PREMIUM</Text>
              </View>
              <Text style={s.userEmail} numberOfLines={1}>
                {email}
              </Text>
            </View>

            {/* Right: compact vertical metrics */}
            <View style={s.userMetrics}>
              <MetricMini
                value={weightKg > 0 ? weightKg.toFixed(1) : "—"}
                unit="KG"
              />
              <View style={s.metricDivLine} />
              <MetricMini value={heightCm > 0 ? heightCm : "—"} unit="CM" />
              <View style={s.metricDivLine} />
              <MetricMini value={bmi ?? "—"} unit="BMI" accent={!!bmi} />
            </View>
          </View>

          {/* ══════════════════════════════════════════════════════════════
              3. EDIT SECTION (conditional)
          ══════════════════════════════════════════════════════════════ */}
          {editMode && (
            <View style={s.editSection}>
              <View style={s.editSectionHeader}>
                <Text style={s.editSectionTitle}>Edit Profile</Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditMode(false);
                    setSaveState("idle");
                  }}
                  activeOpacity={0.7}
                  style={s.cancelBtn}
                >
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              {/* Name */}
              <View style={s.editField}>
                <Text style={s.editFieldLabel}>Name</Text>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Your name"
                  placeholderTextColor={T.sub}
                  style={s.editInput}
                />
              </View>

              {/* Metrics row */}
              <View style={s.editFieldRow}>
                <View style={[s.editField, { flex: 1 }]}>
                  <Text style={s.editFieldLabel}>Weight (kg)</Text>
                  <TextInput
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="decimal-pad"
                    placeholder="75"
                    placeholderTextColor={T.sub}
                    style={s.editInput}
                    selectTextOnFocus
                  />
                </View>
                <View style={[s.editField, { flex: 1 }]}>
                  <Text style={s.editFieldLabel}>Height (cm)</Text>
                  <TextInput
                    value={heightInput}
                    onChangeText={setHeightInput}
                    keyboardType="number-pad"
                    placeholder="175"
                    placeholderTextColor={T.sub}
                    style={s.editInput}
                    selectTextOnFocus
                  />
                </View>
                <View style={[s.editField, { flex: 1 }]}>
                  <Text style={s.editFieldLabel}>Age</Text>
                  <TextInput
                    value={ageInput}
                    onChangeText={setAgeInput}
                    keyboardType="number-pad"
                    placeholder="25"
                    placeholderTextColor={T.sub}
                    style={s.editInput}
                    selectTextOnFocus
                  />
                </View>
              </View>

              {/* Goal picker */}
              <Text style={s.editFieldLabel}>Fitness Goal</Text>
              <View style={s.goalGrid}>
                {GOALS.map((goal) => {
                  const active = goalInput === goal.id;
                  return (
                    <TouchableOpacity
                      key={goal.id}
                      onPress={() => setGoalInput(goal.id)}
                      activeOpacity={0.75}
                      style={[s.goalChip, active && s.goalChipActive]}
                    >
                      <Ionicons
                        name={goal.icon}
                        size={13}
                        color={active ? T.gold : T.sub}
                      />
                      <Text
                        style={[s.goalChipText, active && { color: T.gold }]}
                      >
                        {goal.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════
              4. PERFORMANCE SNAPSHOT
          ══════════════════════════════════════════════════════════════ */}
          <Text style={s.sectionLabel}>PERFORMANCE SNAPSHOT</Text>
          <View style={s.snapshotRow}>
            {/* Streak card */}
            <View style={s.snapshotCard}>
              <Ionicons name="flame-outline" size={18} color={T.sub} />
              <Text style={s.snapshotValue}>{streakDays}</Text>
              <Text style={s.snapshotLabel}>Total Sessions</Text>
            </View>

            {/* This week card */}
            <View style={s.snapshotCard}>
              <Ionicons name="calendar-outline" size={18} color={T.sub} />
              <Text style={[s.snapshotValue, { color: T.gold }]}>
                {thisWeek}
              </Text>
              <Text style={s.snapshotLabel}>This Week</Text>
            </View>

            {/* Active goal card */}
            <View style={s.snapshotCard}>
              <Ionicons name={activeGoal.icon} size={18} color={T.sub} />
              <Text style={[s.snapshotValue, { fontSize: 13, lineHeight: 15 }]}>
                {activeGoal.label.split(" ")[0]}
              </Text>
              <Text style={s.snapshotLabel}>Goal</Text>
            </View>
          </View>

          {/* ══════════════════════════════════════════════════════════════
              5. SETTINGS CARD (unified dark surface)
          ══════════════════════════════════════════════════════════════ */}
          <Text style={s.sectionLabel}>APP SETTINGS</Text>
          <View style={s.settingsCard}>
            {SETTINGS.map((setting, i) => {
              const isLast = i === SETTINGS.length - 1;

              let rightValue: string | null = null;
              if (setting.id === "goal") rightValue = activeGoal.label;
              if (setting.id === "account") rightValue = email;

              return (
                <TouchableOpacity
                  key={setting.id}
                  style={[s.settingRow, isLast && { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (setting.id === "body" || setting.id === "goal") {
                      setEditMode(true);
                    } else if (setting.id === "help") {
                      Alert.alert(
                        "Help & Support",
                        "For assistance, contact support@fitnessapp.com",
                        [{ text: "OK" }],
                      );
                    }
                  }}
                >
                  {/* Icon — plain, no colored badge */}
                  <Ionicons name={setting.icon} size={18} color={T.sub} />

                  {/* Title + optional sub */}
                  <View style={s.settingContent}>
                    <Text style={s.settingTitle}>{setting.label}</Text>
                    {rightValue && (
                      <Text style={s.settingValue} numberOfLines={1}>
                        {rightValue}
                      </Text>
                    )}
                  </View>

                  <Ionicons name="chevron-forward" size={14} color={T.sub} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ══════════════════════════════════════════════════════════════
              6. SIGN OUT
          ══════════════════════════════════════════════════════════════ */}
          <SignOutButton
            pending={signOutMutation.isPending}
            onConfirm={() =>
              Alert.alert(
                "Sign out?",
                "You'll need to sign back in to access your data.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: () => signOutMutation.mutate(),
                  },
                ],
              )
            }
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  screen: {
    flex: 1,
    backgroundColor: T.bg,
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },

  // ── 1. Premium header ──────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 6,
    paddingBottom: 20,
  },
  headerLeft: { gap: 2 },
  headerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  headerLabelText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.sub,
    letterSpacing: 1.5,
  },
  headerGreeting: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.sub,
  },
  headerHero: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 38,
    color: T.text,
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editBtnActive: {
    backgroundColor: T.gold,
  },
  editBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.gold,
  },
  editBtnActiveText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.bg,
  },

  // ── 2. Avatar + biometrics card ────────────────────────────────────────────
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },

  // Avatar — sharp container, gold ring
  avatarRing: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.gold + "AA",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 24,
    color: T.text,
    letterSpacing: 1,
  },

  // Center: user info
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.text,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  memberBadge: {
    alignSelf: "flex-start",
    backgroundColor: T.gold + "14",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  memberText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 9,
    color: T.gold,
    letterSpacing: 0.6,
  },
  userEmail: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },

  // Right: compact metrics column
  userMetrics: {
    alignItems: "flex-end",
    gap: 2,
  },
  metricMini: {
    alignItems: "flex-end",
    gap: 0,
  },
  metricMiniValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 16,
    color: T.text,
    lineHeight: 18,
    letterSpacing: -0.3,
  },
  metricMiniUnit: {
    fontFamily: "DMSans_500Medium",
    fontSize: 8,
    color: T.sub,
    letterSpacing: 0.5,
    lineHeight: 10,
  },
  metricDivLine: {
    width: 28,
    height: 1,
    backgroundColor: T.border,
    marginVertical: 4,
    alignSelf: "flex-end",
  },

  // ── 3. Edit section ────────────────────────────────────────────────────────
  editSection: {
    backgroundColor: T.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  editSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  editSectionTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
    letterSpacing: 0.3,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: T.surface,
  },
  cancelBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.sub,
  },
  editField: {
    gap: 6,
  },
  editFieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  editFieldLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.sub,
    letterSpacing: 0.4,
  },
  editInput: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.text,
    backgroundColor: T.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  // Goal picker grid
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  goalChipActive: {
    backgroundColor: T.gold + "16",
  },
  goalChipText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.sub,
  },

  // ── 4. Performance snapshot ────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.text,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 8,
  },
  snapshotRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  snapshotCard: {
    flex: 1,
    backgroundColor: T.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  snapshotValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 22,
    color: T.text,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  snapshotLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.sub,
    letterSpacing: 0.4,
    textAlign: "center",
  },

  // ── 5. Settings card ──────────────────────────────────────────────────────
  settingsCard: {
    backgroundColor: T.card,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: T.text,
  },
  settingValue: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },

  // ── 6. Sign out ───────────────────────────────────────────────────────────
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 14,
  },
  signOutBtnPressed: {
    borderColor: T.red + "55",
  },
  signOutText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
