import { ProgressDots } from "@/src/ui/components/ProgressDots";
import {
  ExperienceIcon,
  ExperienceLevel,
} from "@/src/ui/components/ExperienceIcon";
import {
  EquipmentIcon,
  EquipmentAccess,
} from "@/src/ui/components/EquipmentIcon";
import { FONTS } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSaveProfile } from "../hooks/useProfile";

const C = {
  bg: "#121212",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#FFC700",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

const DAYS = [2, 3, 4, 5, 6];

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
  const params = useLocalSearchParams();
  const [days, setDays] = useState<number | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [equipment, setEquipment] = useState<EquipmentAccess | null>(null);
  const [loading, setLoading] = useState(false);

  const { mutateAsync: saveProfile } = useSaveProfile();

  const canContinue = !!days && !!experience && !!equipment;

  async function handleContinue() {
    if (!canContinue) return;
    setLoading(true);

    try {
      await saveProfile({
        daysPerWeek: days!,
        experience: experience!,
        equipment: equipment!,
      });
      router.push({
        pathname: "/(auth)/onboarding/ready",
        params: {
          ...params,
          daysPerWeek: String(days),
          experience: experience!,
          equipment: equipment!,
        },
      });
    } catch {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text style={s.counter}>STEP 3 OF 3</Text>
          <ProgressDots total={3} current={2} />
          <Text style={s.headline}>YOUR{"\n"}TRAINING.</Text>
          <Text style={s.sub}>
            This shapes your split and how much volume you'll start with.
          </Text>
        </View>

        <Text style={s.sectionLabel}>DAYS PER WEEK</Text>
        <View style={s.dayRow}>
          {DAYS.map((d) => (
            <Pressable
              key={d}
              onPress={() => setDays(d)}
              style={[s.dayChip, days === d && s.dayChipActive]}
            >
              <Text style={[s.dayText, days === d && s.dayTextActive]}>
                {d}
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
                style={[s.expCard, active && s.expCardActive]}
              >
                <ExperienceIcon level={e.id} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={s.expTitle}>{e.title}</Text>
                  <Text style={s.expDesc}>{e.desc}</Text>
                </View>
                <View style={[s.radio, active && s.radioSelected]}>
                  {active && <View style={s.radioDot} />}
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
                style={[s.equipRow, active && s.equipRowActive]}
              >
                <View
                  style={[s.equipIconWrap, active && s.equipIconWrapActive]}
                >
                  <EquipmentIcon type={e.id} active={active} />
                </View>
                <Text style={[s.equipLabel, active && s.equipLabelActive]}>
                  {e.label}
                </Text>
                <View style={[s.radio, active && s.radioSelected]}>
                  {active && <View style={s.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Pressable
          disabled={!canContinue || loading}
          style={[
            s.primaryBtn,
            (!canContinue || loading) && s.primaryBtnDisabled,
          ]}
          onPress={handleContinue}
        >
          {loading ? (
            <ActivityIndicator color={C.bg} size="small" />
          ) : (
            <Text style={s.primaryBtnText}>CONTINUE →</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 24 },
  header: { marginBottom: 20 },
  counter: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  headline: {
    fontFamily: FONTS.black,
    fontSize: 36,
    color: C.text,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  sub: { fontFamily: FONTS.regular, fontSize: 14, color: C.muted },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.muted,
    marginBottom: 12,
  },
  dayRow: { flexDirection: "row", gap: 10 },
  dayChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  dayText: { fontFamily: FONTS.bold, fontSize: 15, color: C.text },
  dayTextActive: { color: C.bg },
  expCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 16,
  },
  expCardActive: { borderColor: C.accent },
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
  equipRowActive: { borderColor: C.accent },
  equipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,199,0,0.12)",
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
  equipLabelActive: { color: C.text },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: C.accent },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.accent,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: C.bg,
    letterSpacing: 1,
  },
});
