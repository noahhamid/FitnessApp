import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { ChipSelect, type ChipOption } from "@/src/ui/components/ChipSelect";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { usePermissions } from "@/src/hooks/usePermissions";
import { WEEKDAY_LABELS_SHORT } from "@/src/lib/plan-day-selection";
import {
  recommendTrainingSchedules,
  type ScheduleSuggestion,
} from "@/src/lib/recommend-training-days";
import { syncWeeklyWorkoutReminders } from "@/src/lib/meal-workout-reminders";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REMINDER_BASE = [
  { id: "7", label: "Morning" },
  { id: "14", label: "Afternoon" },
  { id: "19", label: "Evening" },
] as const;

function paramList(raw?: string | string[]): string[] {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return [];
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function paramOne(raw?: string | string[]): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v || undefined;
}

function sameDays(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((d, i) => d === b[i]);
}

export default function OnboardingScheduleScreen() {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);
  const { requestNotifications } = usePermissions();

  const params = useLocalSearchParams<{
    gender?: string;
    goalId?: string;
    goalDetail?: string;
    experience?: string;
    age?: string;
    pace?: string;
    injuries?: string;
    bodyIssues?: string;
    equipment?: string;
  }>();

  const suggestions = useMemo(
    () =>
      recommendTrainingSchedules({
        goalId: paramOne(params.goalId),
        goalDetail: paramOne(params.goalDetail),
        experience: paramOne(params.experience),
        age: (() => {
          const n = Number(paramOne(params.age));
          return Number.isFinite(n) ? n : undefined;
        })(),
        pace: paramOne(params.pace),
        injuries: paramList(params.injuries),
        bodyIssues: paramList(params.bodyIssues),
        equipment: paramOne(params.equipment),
      }),
    [
      params.age,
      params.bodyIssues,
      params.equipment,
      params.experience,
      params.goalDetail,
      params.goalId,
      params.injuries,
      params.pace,
    ],
  );

  const [weekdays, setWeekdays] = useState<number[]>(
    () => suggestions[0]?.days ?? [],
  );
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState<string[]>(["7"]);
  const [arming, setArming] = useState(false);

  const toggleWeekday = (index: number) => {
    setWeekdays((current) =>
      current.includes(index)
        ? current.filter((d) => d !== index)
        : [...current, index].sort((a, b) => a - b),
    );
  };

  const applySuggestion = (row: ScheduleSuggestion) => {
    setWeekdays(row.days);
  };

  const reminderOptions = useMemo<ChipOption[]>(
    () => REMINDER_BASE.map((opt) => ({ ...opt })),
    [],
  );

  const canContinue =
    weekdays.length > 0 && (!reminderEnabled || reminderHour.length > 0);

  const enableReminder = async () => {
    setReminderEnabled(true);
    await requestNotifications();
  };

  const handleNext = async () => {
    if (!canContinue) return;
    setArming(true);
    try {
      if (reminderEnabled) {
        const granted = await requestNotifications();
        if (granted) {
          await syncWeeklyWorkoutReminders({
            enabled: true,
            hour: Number(reminderHour[0]),
            trainingDays: weekdays,
          });
        }
      } else {
        await syncWeeklyWorkoutReminders({
          enabled: false,
          hour: 7,
          trainingDays: [],
        });
      }
    } catch {
      // Permission or scheduler unavailable — schedule still saves on the profile.
    } finally {
      setArming(false);
    }

    router.push({
      pathname: "/(auth)/onboarding/revised-prediction",
      params: {
        ...params,
        daysPerWeek: String(weekdays.length),
        trainingDays: weekdays.join(","),
        reminderEnabled: reminderEnabled ? "1" : "0",
        ...(reminderEnabled ? { reminderHour: reminderHour[0] } : {}),
      },
    });
  };

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      <OnboardingHeader
        headline={"YOUR\nSCHEDULE."}
        sub="Tap the days you'll train — that sets how often, too."
        onBack={() => router.back()}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
      >
        {suggestions.length > 0 && (
          <>
            <Text style={s.sectionLabel}>RECOMMENDED FOR YOU</Text>
            <View style={s.suggestList}>
              {suggestions.map((row, i) => {
                const active = sameDays(weekdays, row.days);
                return (
                  <Pressable
                    key={row.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => applySuggestion(row)}
                    style={[s.suggestRow, active && s.suggestRowActive]}
                  >
                    <Text style={[s.suggestRank, active && s.suggestRankActive]}>
                      {i + 1}
                    </Text>
                    <View style={s.suggestCopy}>
                      <Text
                        style={[s.suggestTitle, active && s.suggestTitleActive]}
                        numberOfLines={1}
                      >
                        {row.title}
                      </Text>
                      <Text style={s.suggestReason} numberOfLines={1}>
                        {row.reason}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Text style={s.sectionLabel}>
          {weekdays.length === 0
            ? "WHICH DAYS"
            : weekdays.length === 1
              ? "1 DAY A WEEK"
              : `${weekdays.length} DAYS A WEEK`}
        </Text>
        <View style={s.weekdayRow}>
          {WEEKDAY_LABELS_SHORT.map((label, index) => {
            const selected = weekdays.includes(index);
            return (
              <Pressable
                key={label}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={label}
                onPress={() => toggleWeekday(index)}
                style={[s.weekdayChip, selected && s.weekdayChipActive]}
              >
                <Text
                  style={[
                    s.weekdayChipText,
                    selected && s.weekdayChipTextActive,
                  ]}
                >
                  {label.slice(0, 1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={s.reminderHeader}>
          <Text style={s.sectionLabel}>TRAINING REMINDER</Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: reminderEnabled }}
            onPress={() => {
              if (reminderEnabled) setReminderEnabled(false);
              else void enableReminder();
            }}
            style={[s.toggle, reminderEnabled && s.toggleActive]}
          >
            <View
              style={[s.toggleKnob, reminderEnabled && s.toggleKnobActive]}
            />
          </Pressable>
        </View>

        {reminderEnabled ? (
          <>
            <Text style={s.reminderHint}>
              We&apos;ll ping you on training days at this time. Allow
              notifications when asked.
            </Text>
            <ChipSelect
              options={reminderOptions}
              selected={reminderHour}
              onChange={setReminderHour}
              style={s.reminderChips}
            />
          </>
        ) : (
          <Text style={s.reminderOffHint}>
            We won&apos;t send training reminders. Adjust this anytime later.
          </Text>
        )}
      </ScrollView>

      <OnboardingNav
        nextDisabled={!canContinue || arming}
        onNext={() => void handleNext()}
      />
    </SafeAreaView>
  );
}

function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
  safe: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.muted,
    marginBottom: 2,
    marginTop: 8,
  },
  suggestList: {
    gap: 6,
  },
  suggestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: C.bg3,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  suggestRowActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  suggestRank: {
    fontFamily: FONTS.blackItalic,
    fontSize: 18,
    width: 22,
    color: C.muted,
  },
  suggestRankActive: {
    color: "#FFFFFF",
  },
  suggestCopy: {
    flex: 1,
    minWidth: 0,
  },
  suggestTitle: {
    fontFamily: FONTS.blackItalic,
    fontSize: 15,
    letterSpacing: 0.3,
    color: C.text,
    textTransform: "uppercase",
  },
  suggestTitleActive: {
    color: "#FFFFFF",
  },
  suggestReason: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  weekdayRow: {
    flexDirection: "row",
    gap: 6,
  },
  weekdayChip: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 52,
    borderRadius: 12,
    backgroundColor: C.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayChipActive: {
    backgroundColor: C.accent,
  },
  weekdayChipText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: C.muted,
  },
  weekdayChipTextActive: {
    color: "#FFFFFF",
  },
  reminderHeader: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
    marginBottom: 4,
  },
  reminderChips: {
    height: 168,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    backgroundColor: C.bg3,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: C.accent,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  reminderOffHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
  },
});
}
