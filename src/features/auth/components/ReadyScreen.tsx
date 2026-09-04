import { CheckBadge } from "@/src/ui/components/CheckBadge";
import { GoalIcon, GoalIconName } from "@/src/ui/components/GoalIcon";
import {
  ExperienceIcon,
  ExperienceLevel,
} from "@/src/ui/components/ExperienceIcon";
import {
  estimateTimeline,
  formatTargetDate,
  previewSplitLabel,
  type GoalId,
  type Pace,
} from "@/src/lib/onboarding-timeline";
import type { Gender } from "@/src/lib/nutrition-calc";
import { WEEKDAY_LABELS_SHORT } from "@/src/lib/plan-day-selection";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { promptOnboardingReview } from "@/src/lib/store-review";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import {
  isOnboardingRetake,
  onboardingParamsForNavigation,
  saveCompletedOnboardingPayload,
} from "@/src/features/auth/services/onboarding-payload.service";
import { clearOnboardingDraft } from "@/src/features/auth/services/onboarding-draft.service";
import { workoutPlanQueryKey } from "@/src/features/workout/hooks/useWorkoutPlan";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appAlert } from "@/src/components/AppAlert";

const GOAL_LABELS: Record<string, string> = {
  lose: "Lose Fat",
  build: "Build Muscle",
  endure: "Build Endurance",
  health: "Stay Healthy",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  novice: "Novice",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const EQUIPMENT_LABELS: Record<string, string> = {
  full_gym: "Full Gym",
  home_dumbbells: "Home / Dumbbells",
  bodyweight: "Bodyweight Only",
};

const FOCUS_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  arms: "Arms",
  abs: "Abs",
  glutes: "Glutes",
  legs: "Legs",
  full_body: "Full Body",
};

const INJURY_LABELS: Record<string, string> = {
  knees: "Knees",
  back: "Back",
  shoulders: "Shoulders",
  wrists: "Wrists",
};

const GOAL_DETAIL_LABELS: Record<string, string> = {
  steady: "Lose weight steadily",
  tone: "Tone up / recomposition",
  aggressive_cut: "Aggressive cut",
  bulk: "Bulk up",
  lean_muscle: "Lean muscle",
  strength: "Strength focus",
  stamina: "Improve stamina",
  event: "Train for an event",
  conditioning: "General conditioning",
  wellness: "General wellness",
  energy: "More energy",
  habit: "Build the habit",
};

const PACE_LABELS: Record<string, string> = {
  slow: "Slow & steady",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

const BODY_ISSUE_LABELS: Record<string, string> = {
  sitting: "Prolonged sitting",
  sleep: "Poor sleep quality",
  diet: "Dietary issues",
};

const REMINDER_LABELS: Record<string, string> = {
  "7": "Morning · around 7:00",
  "14": "Afternoon · around 14:00",
  "19": "Evening · around 19:00",
};

export function ReadyScreen() {
  const { styles: s } = useOnboardingStyles(makeStyles);
  const params = useLocalSearchParams<{
    goalId?: string;
    goalDetail?: string;
    weightKg?: string;
    targetWeightKg?: string;
    heightCm?: string;
    age?: string;
    gender?: string;
    pace?: string;
    daysPerWeek?: string;
    trainingDays?: string;
    experience?: string;
    equipment?: string;
    focusAreas?: string;
    injuries?: string;
    bodyIssues?: string;
    bodyFatPercent?: string;
    bodyFatSource?: string;
    reminderEnabled?: string;
    reminderHour?: string;
    retake?: string;
  }>();

  const queryClient = useQueryClient();
  const isRetake = isOnboardingRetake(params);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;
  const badgeScale = useRef(new Animated.Value(0.6)).current;
  const continuing = useRef(false);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [badgeScale, fade, rise]);

  const insets = useSafeAreaInsets();
  const goalId = params.goalId as GoalIconName | undefined;
  const experience = params.experience as ExperienceLevel | undefined;

  const focusAreas = useMemo(
    () => (params.focusAreas ?? "").split(",").filter(Boolean),
    [params.focusAreas],
  );
  const injuries = useMemo(
    () =>
      (params.injuries ?? "")
        .split(",")
        .filter((i) => i && i !== "none"),
    [params.injuries],
  );
  const bodyIssues = useMemo(
    () =>
      (params.bodyIssues ?? "")
        .split(",")
        .filter((i) => i && i !== "none"),
    [params.bodyIssues],
  );
  const trainingDayLabels = useMemo(() => {
    return (params.trainingDays ?? "")
      .split(",")
      .map((d) => Number(d))
      .filter((d) => Number.isFinite(d) && d >= 0 && d <= 6)
      .map((d) => WEEKDAY_LABELS_SHORT[d])
      .join(" - ");
  }, [params.trainingDays]);

  const splitLabel = useMemo(() => {
    const days = parseInt(params.daysPerWeek ?? "3", 10) || 3;
    return previewSplitLabel(days, experience ?? "novice");
  }, [params.daysPerWeek, experience]);

  const timeline = useMemo(() => {
    const currentKg = parseInt(params.weightKg ?? "", 10);
    const targetKg = parseInt(params.targetWeightKg ?? "", 10);
    if (!Number.isFinite(currentKg) || !Number.isFinite(targetKg)) return null;
    const age = parseInt(params.age ?? "", 10);
    const heightCm = parseInt(params.heightCm ?? "", 10);
    const days = parseInt(params.daysPerWeek ?? "", 10);
    const bf = Number(params.bodyFatPercent);
    return estimateTimeline({
      goalId: (params.goalId ?? "health") as GoalId,
      currentKg,
      targetKg,
      pace: (params.pace ?? "moderate") as Pace,
      daysPerWeek: Number.isFinite(days) ? days : undefined,
      gender: (params.gender === "female" ? "female" : "male") as Gender,
      age: Number.isFinite(age) ? age : undefined,
      heightCm: Number.isFinite(heightCm) ? heightCm : undefined,
      experience: experience ?? "intermediate",
      bodyFatPercent: Number.isFinite(bf) && bf > 0 ? bf : undefined,
    });
  }, [
    experience,
    params.age,
    params.bodyFatPercent,
    params.daysPerWeek,
    params.gender,
    params.goalId,
    params.heightCm,
    params.pace,
    params.targetWeightKg,
    params.weightKg,
  ]);

  return (
    <View
      style={[
        s.safe,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={s.content}>
        <View style={{ flex: 1 }} />

        <Animated.View
          style={{ alignItems: "center", transform: [{ scale: badgeScale }] }}
        >
          <CheckBadge />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: rise }],
            marginTop: 24,
          }}
        >
          <Text style={s.kicker}>
            {isRetake ? "PLAN UPDATED" : "YOU'RE ALL SET"}
          </Text>
          <Text style={s.headline}>
            {isRetake ? "NEW PLAN\nREADY." : "PLAN\nREADY."}
          </Text>

          <ScrollView
            style={s.summaryScroll}
            contentContainerStyle={s.summaryCard}
            showsVerticalScrollIndicator={false}
          >
            {goalId && (
              <View style={s.summaryRow}>
                <GoalIcon name={goalId} size={40} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={s.rowLabel}>GOAL</Text>
                  <Text style={s.rowValue}>
                    {GOAL_LABELS[goalId] ?? goalId}
                  </Text>
                  {params.goalDetail ? (
                    <Text style={s.rowSubValue}>
                      {GOAL_DETAIL_LABELS[params.goalDetail] ?? params.goalDetail}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}

            {params.targetWeightKg ? (
              <>
                <View style={s.divider} />
                <View>
                  <Text style={s.rowLabel}>
                    {goalId === "endure" || goalId === "health"
                      ? "MAINTAIN WEIGHT"
                      : "TARGET WEIGHT"}
                  </Text>
                  <Text style={s.rowValue}>{params.targetWeightKg} kg</Text>
                  {timeline ? (
                    <Text style={s.rowSubValue}>
                      {timeline.alreadyThere
                        ? "You're already at this weight"
                        : `Estimated around ${formatTargetDate(timeline.targetDate)}`}
                    </Text>
                  ) : null}
                </View>
              </>
            ) : null}

            <View style={s.divider} />

            <View style={s.statRow}>
              <View style={s.statBlock}>
                <Text style={s.rowLabel}>GENDER</Text>
                <Text style={s.rowValue}>
                  {params.gender === "male"
                    ? "Male"
                    : params.gender === "female"
                      ? "Female"
                      : "—"}
                </Text>
              </View>
              <View style={s.statBlock}>
                <Text style={s.rowLabel}>AGE</Text>
                <Text style={s.rowValue}>
                  {params.age ? `${params.age}` : "—"}
                </Text>
              </View>
              <View style={s.statBlock}>
                <Text style={s.rowLabel}>WEIGHT</Text>
                <Text style={s.rowValue}>{params.weightKg ?? "—"} kg</Text>
              </View>
              <View style={s.statBlock}>
                <Text style={s.rowLabel}>HEIGHT</Text>
                <Text style={s.rowValue}>{params.heightCm ?? "—"} cm</Text>
              </View>
            </View>

            {params.pace ? (
              <>
                <View style={s.divider} />
                <View>
                  <Text style={s.rowLabel}>PLAN PACE</Text>
                  <Text style={s.rowValue}>
                    {PACE_LABELS[params.pace] ?? params.pace}
                  </Text>
                </View>
              </>
            ) : null}

            {params.bodyFatPercent ? (
              <>
                <View style={s.divider} />
                <View style={s.summaryRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowLabel}>BODY FAT</Text>
                    <Text style={s.rowValue}>{params.bodyFatPercent}%</Text>
                    <Text style={s.rowSubValue}>
                      {params.bodyFatSource === "measured"
                        ? "The % you entered"
                        : "Middle of the range you picked"}
                    </Text>
                  </View>
                </View>
              </>
            ) : null}

            <View style={s.divider} />

            <View style={s.summaryRow}>
              {experience && <ExperienceIcon level={experience} />}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={s.rowLabel}>WORKOUT SPLIT</Text>
                <Text style={s.rowValue}>
                  {params.daysPerWeek ?? "—"} days/week · {splitLabel}
                </Text>
                <Text style={s.rowSubValue}>
                  {experience ? EXPERIENCE_LABELS[experience] : "—"} ·{" "}
                  {params.equipment ? EQUIPMENT_LABELS[params.equipment] : "—"}
                </Text>
                {trainingDayLabels ? (
                  <Text style={s.rowSubValue}>{trainingDayLabels}</Text>
                ) : null}
              </View>
            </View>

            {params.reminderEnabled === "1" && params.reminderHour ? (
              <>
                <View style={s.divider} />
                <View>
                  <Text style={s.rowLabel}>REMINDER</Text>
                  <Text style={s.rowValue}>
                    {REMINDER_LABELS[params.reminderHour] ??
                      `Around ${params.reminderHour}:00`}
                  </Text>
                </View>
              </>
            ) : params.reminderEnabled === "0" ? (
              <>
                <View style={s.divider} />
                <View>
                  <Text style={s.rowLabel}>REMINDER</Text>
                  <Text style={s.rowValue}>Off</Text>
                </View>
              </>
            ) : null}

            {focusAreas.length > 0 && (
              <>
                <View style={s.divider} />
                <View>
                  <Text style={s.rowLabel}>EXTRA FOCUS</Text>
                  <Text style={s.rowValue}>
                    {focusAreas.map((f) => FOCUS_LABELS[f] ?? f).join(" · ")}
                  </Text>
                </View>
              </>
            )}

            {bodyIssues.length > 0 && (
              <>
                <View style={s.divider} />
                <View>
                  <Text style={s.rowLabel}>BODY NOTES</Text>
                  <Text style={s.rowValue}>
                    {bodyIssues
                      .map((i) => BODY_ISSUE_LABELS[i] ?? i)
                      .join(" · ")}
                  </Text>
                </View>
              </>
            )}

            {injuries.length > 0 && (
              <>
                <View style={s.divider} />
                <View>
                  <Text style={s.rowLabel}>WORKING AROUND</Text>
                  <Text style={s.rowValue}>
                    {injuries.map((i) => INJURY_LABELS[i] ?? i).join(" · ")}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Pressable
          style={s.primaryBtn}
          onPress={async () => {
            if (continuing.current) return;
            continuing.current = true;
            try {
              if (isRetake) {
                const nextParams = onboardingParamsForNavigation({
                  ...params,
                  onboardingComplete: "1",
                });
                const saved = await saveCompletedOnboardingPayload(nextParams);
                if (!saved) {
                  throw new Error("Could not save your updated plan.");
                }
                await clearOnboardingDraft();
                useAuthStore.getState().setOnboarded(true);
                await queryClient.invalidateQueries({
                  queryKey: ["user", "profile"],
                });
                await queryClient.invalidateQueries({
                  queryKey: ["nutrition", "goals"],
                });
                await queryClient.invalidateQueries({
                  queryKey: workoutPlanQueryKey,
                });
                router.replace("/(app)/(tabs)");
                return;
              }
              await Promise.race([
                promptOnboardingReview(),
                new Promise<void>((resolve) => setTimeout(resolve, 2500)),
              ]);
              router.push({ pathname: "/(auth)/paywall", params });
            } catch {
              continuing.current = false;
              appAlert(
                "Couldn't save your plan",
                "Check your connection and try again. Your workouts and meals are still on your account.",
              );
            }
          }}
        >
          <Text style={s.primaryBtnText}>
            {isRetake ? "UPDATE MY PLAN" : "CONTINUE"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, paddingHorizontal: 24 },
  kicker: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 3,
    color: C.accent,
    textAlign: "center",
    marginBottom: 8,
  },
  headline: {
    fontFamily: FONTS.black,
    fontSize: 36,
    lineHeight: 38,
    color: C.text,
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 16,
  },
  summaryScroll: {
    maxHeight: 340,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  summaryCard: {
    padding: 16,
  },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  statRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  statBlock: { alignItems: "flex-start", flexShrink: 1 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 10 },
  rowLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 3,
  },
  rowValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: C.text,
  },
  rowSubValue: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontFamily: FONTS.blackItalic,
    fontSize: 15,
    letterSpacing: 1,
    color: C.onAccent,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
}

