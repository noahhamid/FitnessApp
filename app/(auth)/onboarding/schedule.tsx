import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { ChipSelect, type ChipOption } from "@/src/ui/components/ChipSelect";
import { C, FONTS } from "@/src/ui/tokens";
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
  const params = useLocalSearchParams<{ gender?: string }>();
  const [days, setDays] = useState<string[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState<string[]>(["7"]);

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
    days.length > 0 && (!reminderEnabled || reminderHour.length > 0);

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

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
          onChange={setDays}
          columns={2}
        />

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
              reminderEnabled: reminderEnabled ? "1" : "0",
              ...(reminderEnabled ? { reminderHour: reminderHour[0] } : {}),
            },
          })
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
