import {
  ONBOARDING_STEPS,
  onboardingStepIndex,
  onboardingStepLabel,
} from "@/app/(auth)/onboarding/steps";
import { ProgressDots } from "@/src/ui/components/ProgressDots";
import {
  ExperienceIcon,
  ExperienceLevel,
} from "@/src/ui/components/ExperienceIcon";
import {
  EquipmentIcon,
  EquipmentAccess,
} from "@/src/ui/components/EquipmentIcon";
import { C, FONTS } from "@/src/ui/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STEP = "training-setup" as const;
const STEP_INDEX = onboardingStepIndex(STEP);

const DAYS = [2, 3, 4, 5, 6, 7];

const REMINDER_TIMES: { hour: number; label: string }[] = [
  { hour: 7, label: "MORNING · 7 AM" },
  { hour: 14, label: "AFTERNOON · 2 PM" },
  { hour: 19, label: "EVENING · 7 PM" },
];

const EXPERIENCE: { id: ExperienceLevel; title: string; desc: string }[] = [
  {
    id: "novice",
    title: "Novice",
    desc: "New to structured training, or less than 6 months in.",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    desc: "Training consistently for 6 months to 2 years.",
  },
  {
    id: "advanced",
    title: "Advanced",
    desc: "2+ years of consistent, progressive training.",
  },
];

const EQUIPMENT: { id: EquipmentAccess; label: string }[] = [
  { id: "full_gym", label: "Full Gym" },
  { id: "home_dumbbells", label: "Home / Dumbbells" },
  { id: "bodyweight", label: "Bodyweight Only" },
];

export function TrainingSetupForm() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [days, setDays] = useState<number | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [equipment, setEquipment] = useState<EquipmentAccess | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState(7);

  const canContinue = !!days && !!experience && !!equipment;

  function handleContinue() {
    if (!canContinue) return;

    const nextParams = {
      ...params,
      daysPerWeek: String(days),
      experience: experience!,
      equipment: equipment!,
      reminderEnabled: reminderEnabled ? "1" : "0",
      ...(reminderEnabled ? { reminderHour: String(reminderHour) } : {}),
    };

    router.push({
      pathname: "/(auth)/onboarding/revised-prediction",
      params: nextParams,
    });
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.headerWrap}>
        <LinearGradient
          colors={[C.bg, "#3A1818", C.accentDeep]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0.6 }}
          end={{ x: 1, y: 0 }}
          style={s.headerGradient}
        />

        <View style={s.header}>
          <View style={s.stepRow}>
            <Text style={s.counter}>{onboardingStepLabel(STEP)}</Text>
            <ProgressDots
              total={ONBOARDING_STEPS.length}
              current={STEP_INDEX}
            />
          </View>

          <View style={s.titleLogoRow}>
            <View style={s.titleTextGroup}>
              <Text style={s.headline}>YOUR{"\n"}TRAINING.</Text>
              <Text style={s.sub}>
                Shape your split, experience level and available equipment.
              </Text>
            </View>

            <View style={s.logoContainer}>
              <Image
                source={require("@/assets/images/potentialpeak_logo_nobackground.jpg")}
                style={s.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.sectionLabel}>DAYS PER WEEK</Text>
        <View style={s.dayRow}>
          {DAYS.map((d) => (
            <Pressable
              key={d}
              onPress={() => setDays(d)}
              accessibilityRole="radio"
              accessibilityState={{ selected: days === d }}
              style={({ pressed }) => [
                s.dayChip,
                days === d && s.dayChipActive,
                pressed && s.optionPressed,
              ]}
            >
              <Text style={[s.dayText, days === d && s.dayTextActive]}>
                {d} DAYS
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[s.sectionLabel, { marginTop: 28 }]}>
          EXPERIENCE LEVEL
        </Text>
        <View style={{ gap: 12 }}>
          {EXPERIENCE.map((e) => {
            const active = experience === e.id;
            return (
              <Pressable
                key={e.id}
                onPress={() => setExperience(e.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  s.expCard,
                  active && s.expCardActive,
                  pressed && s.optionPressed,
                ]}
              >
                <ExperienceIcon level={e.id} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[s.expTitle, active && s.optionTitleActive]}>
                    {e.title}
                  </Text>
                  <Text style={[s.expDesc, active && s.optionDescActive]}>
                    {e.desc}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text style={[s.sectionLabel, { marginTop: 28 }]}>
          EQUIPMENT ACCESS
        </Text>
        <View style={{ gap: 10 }}>
          {EQUIPMENT.map((e) => {
            const active = equipment === e.id;
            return (
              <Pressable
                key={e.id}
                onPress={() => setEquipment(e.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  s.equipRow,
                  active && s.equipRowActive,
                  pressed && s.optionPressed,
                ]}
              >
                <View
                  style={[s.equipIconWrap, active && s.equipIconWrapActive]}
                >
                  <EquipmentIcon type={e.id} active={active} />
                </View>
                <Text style={[s.equipLabel, active && s.equipLabelActive]}>
                  {e.label}
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
            onPress={() => setReminderEnabled((v) => !v)}
            style={[s.toggle, reminderEnabled && s.toggleActive]}
          >
            <View style={[s.toggleKnob, reminderEnabled && s.toggleKnobActive]} />
          </Pressable>
        </View>
        {reminderEnabled ? (
          <View style={s.dayRow}>
            {REMINDER_TIMES.map((t) => (
              <Pressable
                key={t.hour}
                onPress={() => setReminderHour(t.hour)}
                accessibilityRole="radio"
                accessibilityState={{ selected: reminderHour === t.hour }}
                style={({ pressed }) => [
                  s.dayChip,
                  reminderHour === t.hour && s.dayChipActive,
                  pressed && s.optionPressed,
                ]}
              >
                <Text
                  style={[
                    s.dayText,
                    reminderHour === t.hour && s.dayTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={s.reminderOffHint}>
            We won&apos;t send training reminders. Adjust this anytime later.
          </Text>
        )}
      </ScrollView>

      <View style={s.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            s.backBtn,
            pressed && s.buttonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Text style={s.backText}>← BACK</Text>
        </Pressable>

        <Pressable
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          style={({ pressed }) => [
            s.primaryBtn,
            !canContinue && s.primaryBtnDisabled,
            pressed && s.buttonPressed,
          ]}
          onPress={handleContinue}
        >
          <Text style={s.primaryBtnText}>CONTINUE</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  headerWrap: {
    position: "relative",
    zIndex: 5,
    marginTop: 10,
    marginHorizontal: 14,
    marginBottom: 6,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: C.bg,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 14,
  },
  stepRow: {
    marginTop: 8,
  },
  titleLogoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -8,
  },
  titleTextGroup: {
    flex: 1,
    paddingRight: 8,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  counter: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  headline: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: C.text,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.muted,
    marginBottom: 12,
  },
  dayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayChip: {
    flexGrow: 1,
    minWidth: 92,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  dayText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    letterSpacing: 0.8,
    color: C.text,
  },
  dayTextActive: { color: "#FFFFFF" },
  expCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 16,
  },
  expCardActive: {
    borderColor: C.accent,
    backgroundColor: "rgba(229,57,53,0.14)",
  },
  expTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: C.text,
    marginBottom: 3,
  },
  expDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
    lineHeight: 16,
  },
  equipRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14,
  },
  equipRowActive: {
    borderColor: C.accent,
    backgroundColor: "rgba(229,57,53,0.14)",
  },
  equipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(229,57,53,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  equipIconWrapActive: { backgroundColor: C.accent },
  equipLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: C.text,
    marginLeft: 14,
    flex: 1,
  },
  equipLabelActive: {
    color: "#FFFFFF",
  },
  optionTitleActive: {
    color: "#FFFFFF",
  },
  optionDescActive: {
    color: "rgba(255,255,255,0.78)",
  },
  optionPressed: {
    opacity: 0.82,
  },
  reminderHeader: {
    marginTop: 28,
    marginBottom: 12,
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
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  backBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 0.8,
    color: C.text,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.35, shadowOpacity: 0 },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
