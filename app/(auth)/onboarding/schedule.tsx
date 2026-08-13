import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { ChipSelect, type ChipOption } from "@/src/ui/components/ChipSelect";
import { FONTS, useOnboardingColors, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import {
  defaultTrainingDays,
  WEEKDAY_LABELS_SHORT,
} from "@/src/lib/plan-day-selection";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAYS = [2, 3, 4, 5, 6, 7];

const REMINDER_BASE = [
  { id: "7", label: "Morning" },
  { id: "14", label: "Afternoon" },
  { id: "19", label: "Evening" },
] as const;

export default function OnboardingScheduleScreen() {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);

  const params = useLocalSearchParams<{ gender?: string }>();
  const [days, setDays] = useState<string[]>([]);
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState<string[]>(["7"]);

  const targetCount = days.length > 0 ? Number(days[0]) : 0;

  // Picking a frequency reseeds the weekdays with the recommended spacing —
  // most people keep it, and it guarantees a valid starting selection.
  const handleDaysChange = (next: string[]) => {
    setDays(next);
    const count = next.length > 0 ? Number(next[0]) : 0;
    setWeekdays(count > 0 ? defaultTrainingDays(count) : []);
  };

  const toggleWeekday = (index: number) => {
    setWeekdays((current) => {
      if (current.includes(index)) {
        return current.filter((d) => d !== index);
      }
      if (current.length >= targetCount) return current;
      return [...current, index].sort((a, b) => a - b);
    });
  };

  const weekdaysComplete = targetCount > 0 && weekdays.length === targetCount;
  const remaining = targetCount - weekdays.length;

  // No photo can honestly depict "4 days a week", so these stay text-only.
  const dayOptions = useMemo<ChipOption[]>(
    () =>
      DAYS.map((d) => ({
        id: String(d),
        label: `${d} Days`,
      })),
    [],
  );

  const reminderOptions = useMemo<ChipOption[]>(
    () =>
      REMINDER_BASE.map((opt) => ({ ...opt })),
    [],
  );

  const canContinue =
    weekdaysComplete && (!reminderEnabled || reminderHour.length > 0);

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      <OnboardingHeader
        headline={"YOUR\nSCHEDULE."}
        sub="How often you'll train — and when to nudge you."
        onBack={() => router.back()}
      />

      <View style={s.body}>
        <Text style={s.sectionLabel}>DAYS PER WEEK</Text>
        <ChipSelect
          options={dayOptions}
          selected={days}
          onChange={handleDaysChange}
          columns={2}
        />

        {targetCount > 0 && (
          <>
            <Text style={[s.sectionLabel, s.weekdayLabel]}>
              {weekdaysComplete
                ? "WHICH DAYS"
                : `WHICH DAYS — PICK ${remaining} MORE`}
            </Text>
            <View style={s.weekdayRow}>
              {WEEKDAY_LABELS_SHORT.map((label, index) => {
                const selected = weekdays.includes(index);
                const full = !selected && weekdays.length >= targetCount;
                return (
                  <Pressable
                    key={label}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected, disabled: full }}
                    accessibilityLabel={label}
                    onPress={() => toggleWeekday(index)}
                    style={[
                      s.weekdayChip,
                      selected && s.weekdayChipActive,
                      full && s.weekdayChipMuted,
                    ]}
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
          </>
        )}

        <View style={s.reminderHeader}>
          <Text style={s.sectionLabel}>TRAINING REMINDER</Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: reminderEnabled }}
            onPress={() => setReminderEnabled((v) => !v)}
            style={[s.toggle, reminderEnabled && s.toggleActive]}
          >
            <View
              style={[s.toggleKnob, reminderEnabled && s.toggleKnobActive]}
            />
          </Pressable>
        </View>

        {reminderEnabled ? (
          <ChipSelect
            options={reminderOptions}
            selected={reminderHour}
            onChange={setReminderHour}
          />
        ) : (
          <Text style={s.reminderOffHint}>
            We won&apos;t send training reminders. Adjust this anytime later.
          </Text>
        )}
      </View>

      <OnboardingNav
        nextDisabled={!canContinue}
        onNext={() =>
          router.push({
            pathname: "/(auth)/onboarding/revised-prediction",
            params: {
              ...params,
              daysPerWeek: days[0],
              trainingDays: weekdays.join(","),
              reminderEnabled: reminderEnabled ? "1" : "0",
              ...(reminderEnabled ? { reminderHour: reminderHour[0] } : {}),
            },
          })
        }
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
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 6,
    minHeight: 0,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.muted,
    marginBottom: 2,
  },
  weekdayLabel: {
    marginTop: 10,
  },
  weekdayRow: {
    flexDirection: "row",
    gap: 6,
  },
  weekdayChip: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 46,
    borderRadius: 12,
    backgroundColor: C.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayChipActive: {
    backgroundColor: C.accent,
  },
  weekdayChipMuted: {
    opacity: 0.45,
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
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

