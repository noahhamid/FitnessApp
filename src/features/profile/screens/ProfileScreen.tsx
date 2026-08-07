import { useAuth, useSignOut } from "@/src/features/auth/hooks/useAuth";
import {
  fetchUserProfile,
  saveUserProfile,
} from "@/src/features/profile/services/profile.service";
import {
  useCompletedSessionCount,
  useWorkoutHistory,
} from "@/src/features/progress/hooks/useProgress";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { AppearanceModeControl } from "@/src/features/profile/components/AppearanceModeControl";
import { PageHeader } from "@/src/components/PageHeader";
import { weekDatesFor } from "@/src/lib/week-days";

const SUPPORT_EMAIL = "support@fitnessapp.com";

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
    id: "help",
    label: "Help & Support",
    sub: "FAQ · Contact us",
    icon: "help-circle-outline" as const,
  },
] as const;

function MetricMini({
  value,
  unit,
  accent,
}: {
  value: string | number;
  unit: string;
  accent?: boolean;
}) {
  const { T, styles } = useThemedStyles(makeStyles);
  return (
    <View style={styles.metricMini}>
      <Text style={[styles.metricMiniValue, accent && { color: T.accent }]}>
        {value}
      </Text>
      <Text style={styles.metricMiniUnit}>{unit}</Text>
    </View>
  );
}

function SignOutButton({
  onConfirm,
  pending,
}: {
  onConfirm: () => void;
  pending: boolean;
}) {
  const { T, styles } = useThemedStyles(makeStyles);
  const [pressed, setPressed] = useState(false);
  const tint = pressed ? T.badge : T.muted;

  return (
    <TouchableOpacity
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onConfirm}
      activeOpacity={0.85}
      style={[styles.signOutBtn, pressed && styles.signOutBtnPressed]}
    >
      {pending ? (
        <ActivityIndicator size="small" color={tint} />
      ) : (
        <>
          <Ionicons name="log-out-outline" size={16} color={tint} />
          <Text style={[styles.signOutText, { color: tint }]}>Sign Out</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const { user, isPending: authPending } = useAuth();
  const signOutMutation = useSignOut();
  const qc = useQueryClient();

  const { data: profile, isPending: profilePending } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });

  const { weekStart, weekEnd } = useMemo(() => weekDatesFor(0), []);
  const { data: totalSessions = 0 } = useCompletedSessionCount();
  const { data: weekSessions } = useWorkoutHistory(weekStart, weekEnd);
  const thisWeek = weekSessions?.length ?? 0;

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
      // Server PUT /api/profile already upserts NutritionGoal via
      // computeNutritionTargets — refresh clients; do not recompute here.
      await qc.invalidateQueries({ queryKey: ["nutrition", "goals"] });
      setSaveState("saved");
      saveTimeoutRef.current = setTimeout(() => {
        setSaveState("idle");
        setEditMode(false);
      }, 1400);
    } catch (err) {
      setSaveState("idle");
      Alert.alert(
        "Save failed",
        err instanceof Error ? err.message : "Unable to save profile.",
      );
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <LinearGradient
        colors={["rgba(28,63,46,0.06)", "rgba(28,63,46,0)"]}
        style={styles.topWash}
        pointerEvents="none"
      />
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            eyebrow="Athlete profile"
            eyebrowLeading={
              <Ionicons
                name="shield-checkmark-outline"
                size={11}
                color={T.muted}
              />
            }
            subtitle="Manage your account,"
            title="Account"
            action={
              <TouchableOpacity
                style={[styles.editBtn, editMode && styles.editBtnActive]}
                onPress={() =>
                  editMode ? void handleSaveProfile() : setEditMode(true)
                }
                disabled={saveState === "saving"}
                activeOpacity={0.8}
              >
                {saveState === "saving" ? (
                  <ActivityIndicator
                    size="small"
                    color={T.onAccent}
                    style={{ width: 40 }}
                  />
                ) : saveState === "saved" ? (
                  <>
                    <Ionicons name="checkmark" size={13} color={T.onAccent} />
                    <Text style={styles.editBtnActiveText}>Saved</Text>
                  </>
                ) : editMode ? (
                  <>
                    <Ionicons name="checkmark" size={13} color={T.onAccent} />
                    <Text style={styles.editBtnActiveText}>Save</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="pencil-outline" size={12} color={T.accent} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </>
                )}
              </TouchableOpacity>
            }
          />

          {loading && (
            <View style={{ paddingBottom: 8, paddingLeft: 16 }}>
              <ActivityIndicator color={T.accent} size="small" />
            </View>
          )}

          <GlassSurface style={styles.userCard}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {email}
              </Text>
            </View>

            <View style={styles.userMetrics}>
              <MetricMini
                value={weightKg > 0 ? weightKg.toFixed(1) : "—"}
                unit="KG"
              />
              <View style={styles.metricDivLine} />
              <MetricMini value={heightCm > 0 ? heightCm : "—"} unit="CM" />
              <View style={styles.metricDivLine} />
              <MetricMini value={bmi ?? "—"} unit="BMI" accent={!!bmi} />
            </View>
          </GlassSurface>

          {editMode && (
            <GlassSurface style={styles.editSection}>
              <View style={styles.editSectionHeader}>
                <Text style={styles.editSectionTitle}>Edit Profile</Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditMode(false);
                    setSaveState("idle");
                  }}
                  activeOpacity={0.7}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Name</Text>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Your name"
                  placeholderTextColor={T.muted}
                  style={styles.editInput}
                />
              </View>

              <View style={styles.editFieldRow}>
                <View style={[styles.editField, { flex: 1 }]}>
                  <Text style={styles.editFieldLabel}>Weight (kg)</Text>
                  <TextInput
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="decimal-pad"
                    placeholder="75"
                    placeholderTextColor={T.muted}
                    style={styles.editInput}
                    selectTextOnFocus
                  />
                </View>
                <View style={[styles.editField, { flex: 1 }]}>
                  <Text style={styles.editFieldLabel}>Height (cm)</Text>
                  <TextInput
                    value={heightInput}
                    onChangeText={setHeightInput}
                    keyboardType="number-pad"
                    placeholder="175"
                    placeholderTextColor={T.muted}
                    style={styles.editInput}
                    selectTextOnFocus
                  />
                </View>
                <View style={[styles.editField, { flex: 1 }]}>
                  <Text style={styles.editFieldLabel}>Age</Text>
                  <TextInput
                    value={ageInput}
                    onChangeText={setAgeInput}
                    keyboardType="number-pad"
                    placeholder="25"
                    placeholderTextColor={T.muted}
                    style={styles.editInput}
                    selectTextOnFocus
                  />
                </View>
              </View>

              <Text style={styles.editFieldLabel}>Fitness Goal</Text>
              <View style={styles.goalGrid}>
                {GOALS.map((goal) => {
                  const active = goalInput === goal.id;
                  return (
                    <TouchableOpacity
                      key={goal.id}
                      onPress={() => setGoalInput(goal.id)}
                      activeOpacity={0.75}
                      style={[styles.goalChip, active && styles.goalChipActive]}
                    >
                      <Ionicons
                        name={goal.icon}
                        size={13}
                        color={active ? T.accent : T.muted}
                      />
                      <Text
                        style={[
                          styles.goalChipText,
                          active && { color: T.accent },
                        ]}
                      >
                        {goal.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </GlassSurface>
          )}

          <Text style={styles.sectionLabel}>PERFORMANCE SNAPSHOT</Text>
          <View style={styles.snapshotRow}>
            <GlassSurface style={styles.snapshotCard}>
              <Ionicons name="flame-outline" size={18} color={T.muted} />
              <Text style={styles.snapshotValue}>{totalSessions}</Text>
              <Text style={styles.snapshotLabel}>Total Sessions</Text>
            </GlassSurface>

            <GlassSurface style={styles.snapshotCard}>
              <Ionicons name="calendar-outline" size={18} color={T.muted} />
              <Text style={[styles.snapshotValue, { color: T.accent }]}>
                {thisWeek}
              </Text>
              <Text style={styles.snapshotLabel}>This Week</Text>
            </GlassSurface>

            <GlassSurface style={styles.snapshotCard}>
              <Ionicons name={activeGoal.icon} size={18} color={T.muted} />
              <Text
                style={[styles.snapshotValue, { fontSize: 13, lineHeight: 15 }]}
              >
                {activeGoal.label.split(" ")[0]}
              </Text>
              <Text style={styles.snapshotLabel}>Goal</Text>
            </GlassSurface>
          </View>

          <Text style={styles.sectionLabel}>APP SETTINGS</Text>
          <GlassSurface style={styles.settingsCard}>
            {SETTINGS.map((setting) => {
              const rightValue =
                setting.id === "goal" ? activeGoal.label : null;

              return (
                <TouchableOpacity
                  key={setting.id}
                  style={styles.settingRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (setting.id === "body" || setting.id === "goal") {
                      setEditMode(true);
                    } else if (setting.id === "help") {
                      void Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
                    }
                  }}
                >
                  <Ionicons name={setting.icon} size={18} color={T.muted} />

                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{setting.label}</Text>
                    {setting.sub ? (
                      <Text style={styles.settingValue} numberOfLines={1}>
                        {setting.sub}
                      </Text>
                    ) : rightValue ? (
                      <Text style={styles.settingValue} numberOfLines={1}>
                        {rightValue}
                      </Text>
                    ) : null}
                  </View>

                  <Ionicons name="chevron-forward" size={14} color={T.muted} />
                </TouchableOpacity>
              );
            })}

            {/* Appearance — stacked row inside the same settings card */}
            <View style={[styles.settingRow, styles.appearanceRow]}>
              <View style={styles.appearanceHeader}>
                <Ionicons
                  name="contrast-outline"
                  size={18}
                  color={T.muted}
                />
                <Text style={styles.settingTitle}>Appearance</Text>
              </View>
              <AppearanceModeControl />
            </View>
          </GlassSurface>

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

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: T.bg },
    topWash: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 260,
    },
    screen: {
      flex: 1,
      backgroundColor: T.bg,
      maxWidth: 430,
      alignSelf: "center",
      width: "100%",
    },
    scroll: {
      paddingHorizontal: T.space.xl,
      paddingTop: 8,
      paddingBottom: 32,
    },

    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: T.bgElevated,
      borderRadius: T.radius.pill,
      borderWidth: 0.5,
      borderColor: T.border,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    editBtnActive: {
      backgroundColor: T.accent,
      borderColor: T.accent,
    },
    editBtnText: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.accent,
    },
    editBtnActiveText: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.onAccent,
    },

    userCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: T.radius.lg,
      padding: 16,
      marginBottom: 12,
      gap: 14,
    },
    avatarRing: {
      position: "relative",
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: T.radius.md,
      backgroundColor: T.accentTint,
      borderWidth: 1.5,
      borderColor: T.accentLine,
      alignItems: "center",
      justifyContent: "center",
    },
    initials: {
      fontFamily: T.displayExtraBold,
      fontSize: 22,
      color: T.white,
      letterSpacing: 0.5,
    },
    userInfo: {
      flex: 1,
      gap: 4,
    },
    userName: {
      fontFamily: T.displayBold,
      fontSize: 18,
      color: T.white,
      letterSpacing: -0.2,
      lineHeight: 22,
    },
    userEmail: {
      fontFamily: T.body,
      fontSize: 11,
      color: T.muted,
    },
    userMetrics: {
      alignItems: "flex-end",
      gap: 2,
    },
    metricMini: {
      alignItems: "flex-end",
      gap: 0,
    },
    metricMiniValue: {
      fontFamily: T.displayBold,
      fontSize: 16,
      color: T.white,
      lineHeight: 18,
      letterSpacing: -0.3,
    },
    metricMiniUnit: {
      fontFamily: T.bodyMed,
      fontSize: 8,
      color: T.muted,
      letterSpacing: 0.5,
      lineHeight: 10,
    },
    metricDivLine: {
      width: 28,
      height: StyleSheet.hairlineWidth,
      backgroundColor: T.border,
      marginVertical: 4,
      alignSelf: "flex-end",
    },

    editSection: {
      borderRadius: T.radius.lg,
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
      fontFamily: T.displaySemi,
      fontSize: 16,
      color: T.white,
      letterSpacing: -0.2,
    },
    cancelBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: T.radius.sm,
      backgroundColor: T.accentTint,
    },
    cancelBtnText: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
    },
    editField: {
      gap: 6,
    },
    editFieldRow: {
      flexDirection: "row",
      gap: 10,
    },
    editFieldLabel: {
      fontFamily: T.bodyMed,
      fontSize: 10,
      color: T.muted,
      letterSpacing: 0.4,
    },
    editInput: {
      fontFamily: T.body,
      fontSize: 14,
      color: T.white,
      backgroundColor: T.accentTint,
      borderRadius: T.radius.sm,
      borderWidth: 0.5,
      borderColor: T.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
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
      backgroundColor: T.accentTint,
      borderRadius: T.radius.sm,
      borderWidth: 0.5,
      borderColor: T.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    goalChipActive: {
      backgroundColor: T.accentTint,
      borderColor: T.accent,
    },
    goalChipText: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
    },

    sectionLabel: {
      fontFamily: T.displaySemi,
      fontSize: 12,
      color: T.white,
      letterSpacing: 1,
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
      borderRadius: T.radius.md,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: "center",
      gap: 8,
    },
    snapshotValue: {
      fontFamily: T.displayBold,
      fontSize: 22,
      color: T.white,
      lineHeight: 24,
      letterSpacing: -0.3,
    },
    snapshotLabel: {
      fontFamily: T.body,
      fontSize: 9,
      color: T.muted,
      letterSpacing: 0.4,
      textAlign: "center",
    },

    settingsCard: {
      borderRadius: T.radius.lg,
      overflow: "hidden",
      marginBottom: 16,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: T.border,
    },
    settingContent: {
      flex: 1,
      gap: 2,
    },
    settingTitle: {
      fontFamily: T.bodyMed,
      fontSize: 14,
      color: T.white,
    },
    settingValue: {
      fontFamily: T.body,
      fontSize: 11,
      color: T.muted,
    },
    appearanceRow: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 0,
    },
    appearanceHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },

    signOutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: T.border,
      backgroundColor: "transparent",
      borderRadius: T.radius.md,
      paddingVertical: 14,
    },
    signOutBtnPressed: {
      borderColor: T.badge,
    },
    signOutText: {
      fontFamily: T.displaySemi,
      fontSize: 15,
      letterSpacing: -0.2,
    },
  });
}
