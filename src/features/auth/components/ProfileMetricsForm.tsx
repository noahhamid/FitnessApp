import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { C, FONTS } from "@/src/theme";
import { Button } from "@/src/ui/components/Button";
import { Input } from "@/src/ui/components/Input";
import { ProgressDots } from "@/src/ui/components/ProgressDots";

type Props = { onNext: () => void; onBack: () => void };

export function ProfileMetricsForm({ onNext, onBack }: Props) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [unit, setUnit] = useState("kg");
  const canFinish = !!(weight && height && age);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.counter}>STEP 2 OF 2</Text>
          <ProgressDots total={2} current={1} />
          <View style={s.unitToggle}>
            {["kg", "lbs"].map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setUnit(u)}
                style={[s.unitTab, unit === u && s.unitTabActive]}
              >
                <Text style={[s.unitTabText, unit === u && s.unitTabTextActive]}>{u.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input
            label={`Current weight (${unit})`}
            value={weight}
            onChangeText={setWeight}
            placeholder={unit === "kg" ? "75" : "165"}
            keyboardType="numeric"
          />
          <Input label="Height (cm)" value={height} onChangeText={setHeight} placeholder="175" keyboardType="numeric" />
          <Input label="Age" value={age} onChangeText={setAge} placeholder="25" keyboardType="numeric" />
          <View style={s.nav}>
            <Button outline onPress={onBack} style={s.flex1}>
              BACK
            </Button>
            <Button disabled={!canFinish} onPress={onNext} style={[s.flex2, { marginLeft: 12 }]}>
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
  scroll: { paddingHorizontal: 32, paddingTop: 52, paddingBottom: 48, flexGrow: 1 },
  counter: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: C.bg3,
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignSelf: "flex-start",
  },
  unitTab: { paddingVertical: 7, paddingHorizontal: 20, borderRadius: 8 },
  unitTabActive: { backgroundColor: C.accent },
  unitTabText: { fontFamily: FONTS.bold, fontSize: 13, letterSpacing: 1, color: C.muted },
  unitTabTextActive: { color: C.bg },
  nav: { flexDirection: "row", marginTop: 32 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
});
