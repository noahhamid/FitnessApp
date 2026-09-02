import { useAuth, useSignOut, useDeleteAccount } from "@/src/features/auth/hooks/useAuth";
import { fetchUserProfile, saveUserProfile } from "@/src/features/profile/services/profile.service";
import {
  useCompletedSessionCount,
  useWorkoutHistory,
} from "@/src/features/progress/hooks/useProgress";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { tabContentBottomPad } from "@/src/lib/tab-chrome";
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
import { LinearGradient } from "expo-linear-gradient";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { AppearanceModeControl } from "@/src/features/profile/components/AppearanceModeControl";
import { PageHeader } from "@/src/components/PageHeader";
import { weekDatesFor } from "@/src/lib/week-days";
import {
  defaultTrainingDays,
  normalizeTrainingDays,
  WEEKDAY_LABELS_SHORT,
} from "@/src/lib/plan-day-selection";
import { startOnboardingRetake } from "@/src/features/auth/services/onboarding-draft.service";
import { useIap } from "@/src/features/billing/IapContext";
import {
  PROFILE_EQUIPMENT_OPTIONS,
  PROFILE_EXPERIENCE_OPTIONS,
  PROFILE_GOALS,
} from "@/src/features/profile/lib/profile-edit-options";

type SaveState = "idle" | "saving" | "saved";

function experienceLabel(id: string | null | undefined): string {
  return PROFILE_EXPERIENCE_OPTIONS.find((o) => o.id === id)?.label ?? "Not set";
}

function equipmentLabel(id: string | null | undefined): string {
  return PROFILE_EQUIPMENT_OPTIONS.find((o) => o.id === id)?.label ?? "Not set";
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
    id: "schedule",
    label: "Training Schedule",
    sub: null,
    icon: "calendar-outline" as const,
  },
  {
    id: "training",
    label: "Training Setup",
    sub: null,
    icon: "barbell-outline" as const,
  },
  {
    id: "restore",
    label: "Restore purchases",
    sub: null,
    icon: "card-outline" as const,
  },
  {
    id: "restart",
    label: "Restart setup",
    sub: "Redo the quiz. History stays.",
    icon: "refresh-outline" as const,
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    sub: null,
    icon: "shield-outline" as const,
  },
  {
    id: "terms",
    label: "Terms of Service",
    sub: null,
    icon: "document-text-outline" as const,
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

function DeleteAccountButton({
  onConfirm,
  pending,
}: {
  onConfirm: () => void;
  pending: boolean;
}) {
  const { T, styles } = useThemedStyles(makeStyles);
  const [pressed, setPressed] = useState(false);

  return (
    <TouchableOpacity
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onConfirm}
      activeOpacity={0.85}
      disabled={pending}
      accessibilityRole="button"
      accessibilityLabel="Delete account"
      style={[styles.deleteAccountBtn, pressed && styles.deleteAccountBtnPressed]}
    >
      {pending ? (
        <ActivityIndicator size="small" color={T.badge} />
      ) : (
        <>
          <Ionicons name="trash-outline" size={16} color={T.badge} />
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { user, isPending: authPending } = useAuth();
  const signOutMutation = useSignOut();
  const deleteAccountMutation = useDeleteAccount();
  const { restore, restoring, isPremium } = useIap();
  const qc = useQueryClient();
  const params = useLocalSearchParams<{ editPlan?: string }>();

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
  const activeGoal =
    PROFILE_GOALS.find((g) => g.id === profile?.goalId) ?? PROFILE_GOALS[3];
  // Stored picks win; otherwise show the default pattern for their frequency so
  // the editor always opens on the schedule they're actually training.
  const scheduledDays = useMemo(
    () =>
      normalizeTrainingDays(profile?.trainingDays) ??
      defaultTrainingDays(profile?.daysPerWeek ?? 0),
    [profile?.trainingDays, profile?.daysPerWeek],
  );
  const initials = (user?.name?.trim() ?? "A")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bmi =
    weightKg > 0 && heightCm > 0
      ? (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1)
      : null;

  const applyProfileToInputs = useCallback(() => {
    setNameInput(name);
  }, [name]);

  // Keep form fields mirrored while browsing; never overwrite mid-edit.
  const editSeededRef = useRef(false);
  useEffect(() => {
    if (!editMode) {
      editSeededRef.current = false;
      applyProfileToInputs();
      return;
    }
    if (editSeededRef.current || profilePending) return;
    applyProfileToInputs();
    editSeededRef.current = true;
  }, [applyProfileToInputs, editMode, profilePending]);

  function beginEdit() {
    if (!profilePending) {
      applyProfileToInputs();
      editSeededRef.current = true;
    } else {
      editSeededRef.current = false;
    }
    setEditMode(true);
  }

  useFocusEffect(
    useCallback(() => {
      const flag = Array.isArray(params.editPlan)
        ? params.editPlan[0]
        : params.editPlan;
      if (flag !== "1") return;
      router.setParams({ editPlan: undefined });
      router.push("/(app)/training-schedule");
    }, [params.editPlan]),
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  async function handleSaveProfile() {
    const nextName = nameInput.trim();
    if (!nextName) {
      Alert.alert("Invalid name", "Please enter a valid name.");
      return;
    }

    setSaveState("saving");
    try {
      await saveUserProfile({ name: nextName });
      await qc.invalidateQueries({ queryKey: ["auth", "session"] });
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
        colors={["rgba(229,57,53,0.06)", "rgba(229,57,53,0)"]}
        style={styles.topWash}
        pointerEvents="none"
      />
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={T.bg}
        translucent={false}
      />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: tabContentBottomPad(insets.bottom) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            subtitle="Manage your account,"
            title="Account"
            action={
              <TouchableOpacity
                style={[styles.editBtn, editMode && styles.editBtnActive]}
                onPress={() =>
                  editMode ? void handleSaveProfile() : beginEdit()
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
                <Text style={styles.editSectionTitle}>Edit name</Text>
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
                setting.id === "goal"
                  ? activeGoal.label
                  : setting.id === "schedule"
                    ? scheduledDays.length > 0
                      ? scheduledDays
                          .map((d) => WEEKDAY_LABELS_SHORT[d])
                          .join(" · ")
                      : "Not set"
                    : setting.id === "training"
                      ? `${experienceLabel(profile?.experience)} · ${equipmentLabel(profile?.equipment)}`
                      : setting.id === "restore"
                        ? restoring
                          ? "Restoring…"
                          : isPremium
                            ? "Pro is active"
                            : "Unlock Pro on this device"
                        : null;

              return (
                <TouchableOpacity
                  key={setting.id}
                  style={styles.settingRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (setting.id === "body") {
                      router.push("/(app)/body-health");
                    } else if (setting.id === "goal") {
                      router.push("/(app)/fitness-goal");
                    } else if (setting.id === "schedule") {
                      router.push("/(app)/training-schedule");
                    } else if (setting.id === "training") {
                      router.push("/(app)/training-setup");
                    } else if (setting.id === "restore") {
                      if (restoring) return;
                      void restore().then((ok) => {
                        Alert.alert(
                          ok ? "Purchases restored" : "Nothing to restore",
                          ok
                            ? "Pro is unlocked on this account."
                            : "No verified subscription was found for this Apple or Google account.",
                        );
                      });
                    } else if (setting.id === "restart") {
                      Alert.alert(
                        "Restart setup?",
                        "You'll go through the quiz again and we'll rebuild your plan and nutrition targets. Workouts, meals, and progress stay on your account.",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Restart",
                            onPress: () => {
                              void startOnboardingRetake();
                            },
                          },
                        ],
                      );
                    } else if (setting.id === "privacy") {
                      router.push("/(app)/privacy-policy");
                    } else if (setting.id === "terms") {
                      router.push("/(app)/terms");
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

          <DeleteAccountButton
            pending={deleteAccountMutation.isPending}
            onConfirm={() =>
              Alert.alert(
                "Delete account permanently?",
                "This cannot be undone. It permanently removes your account and all of your data on Exo — workout history, meal logs, weight logs, water logs, nutrition goals, and profile settings.\n\nMeal scan photos stored in the cloud may also become inaccessible.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete Account",
                    style: "destructive",
                    onPress: () => {
                      deleteAccountMutation.mutate(undefined, {
                        onSuccess: (result) => {
                          if (result.verificationEmailSent) {
                            Alert.alert(
                              "Check your email",
                              "We sent a confirmation link to finish deleting your account. Open that link on this device while you are still signed in. Your account stays active until you confirm.",
                            );
                            return;
                          }
                          router.replace("/(auth)/welcome");
                        },
                        onError: (err) => {
                          Alert.alert(
                            "Couldn't delete account",
                            err instanceof Error
                              ? err.message
                              : "Something went wrong. Check your connection and try again — your account was not deleted.",
                          );
                        },
                      });
                    },
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
    weekdayGrid: {
      gap: 6,
      marginTop: 2,
    },
    weekdayRow: {
      flexDirection: "row",
      gap: 6,
    },
    weekdayChip: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: T.accentTint,
      borderRadius: T.radius.sm,
      borderWidth: 0.5,
      borderColor: T.border,
      paddingVertical: 10,
    },
    weekdayChipActive: {
      borderColor: T.accent,
    },
    weekdayChipText: {
      fontFamily: T.bodySemi,
      fontSize: 12,
      color: T.muted,
    },
    weekdayHint: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      lineHeight: 15,
      color: T.muted,
      marginTop: 6,
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
    deleteAccountBtn: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: T.badge,
      backgroundColor: "transparent",
      borderRadius: T.radius.md,
      paddingVertical: 14,
    },
    deleteAccountBtnPressed: {
      opacity: 0.75,
    },
    deleteAccountText: {
      fontFamily: T.displaySemi,
      fontSize: 15,
      letterSpacing: -0.2,
      color: T.badge,
    },
  });
}
