import { Button } from "@/src/ui/components/Button";
import { Input } from "@/src/ui/components/Input";
import { ProgressDots } from "@/src/ui/components/ProgressDots";
import { C, FONTS } from "@/src/ui/tokens";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  onNext: () => void;
  onBack: () => void;
  // Optionally receive goal from previous screen to personalise copy
  goalId?: string;
};

const GOAL_COPY: Record<string, string> = {
  lose: "We need your stats to calculate your deficit.",
  build: "We need your stats to set your protein targets.",
  endure: "We need your stats to calibrate your cardio zones.",
  health: "We need your stats to build your balanced plan.",
};

export function ProfileMetricsForm({ onNext, onBack, goalId }: Props) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  const canFinish = !!(weight && height && age);
  const subCopy = goalId
    ? GOAL_COPY[goalId]
    : "We need your stats to personalise your plan.";

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.counter}>STEP 2 OF 2</Text>
            <ProgressDots total={2} current={1} />
            <Text style={s.headline}>YOUR{"\n"}STATS.</Text>
            <Text style={s.sub}>{subCopy}</Text>
          </View>

          {/* Unit toggle */}
          <View style={s.unitRow}>
            <Text style={s.unitLabel}>UNIT</Text>
            <View style={s.unitToggle}>
              {(["kg", "lbs"] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnit(u)}
                  style={[s.unitTab, unit === u && s.unitTabActive]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[s.unitTabText, unit === u && s.unitTabTextActive]}
                  >
                    {u.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Inputs */}
          <Input
            label={`Weight (${unit})`}
            value={weight}
            onChangeText={setWeight}
            placeholder={unit === "kg" ? "75" : "165"}
            keyboardType="numeric"
          />
          <Input
            label="Height (cm)"
            value={height}
            onChangeText={setHeight}
            placeholder="175"
            keyboardType="numeric"
          />
          <Input
            label="Age"
            value={age}
            onChangeText={setAge}
            placeholder="25"
            keyboardType="numeric"
          />

          {/* Privacy note */}
          <Text style={s.privacy}>
            Your data is stored securely and never shared.
          </Text>

          {/* Nav */}
          <View style={s.nav}>
            <TouchableOpacity style={s.backBtn} onPress={onBack}>
              <Text style={s.backText}>← BACK</Text>
            </TouchableOpacity>
            <Button
              disabled={!canFinish}
              onPress={onNext}
              style={[s.flex2, { marginLeft: 12 }]}
            >
              FINISH SETUP →
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: {
    paddingHorizontal: 32,
    paddingTop: 52,
    paddingBottom: 48,
    flexGrow: 1,
  },
  header: { marginBottom: 28 },
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
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: C.muted,
    lineHeight: 21,
  },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  unitLabel: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: C.bg3,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  unitTab: {
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  unitTabActive: { backgroundColor: C.accent },
  unitTabText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: C.muted,
  },
  unitTabTextActive: { color: C.bg },
  privacy: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
    opacity: 0.6,
  },
  nav: { flexDirection: "row", marginTop: 24 },
  backBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: C.text,
    letterSpacing: 0.8,
  },
  flex2: { flex: 2 },
});
