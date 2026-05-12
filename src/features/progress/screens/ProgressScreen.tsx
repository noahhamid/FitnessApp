import { View, Text, ScrollView, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";
import { WeightChart } from "../components/WeightChart";
import { BodyFatChart } from "../components/BodyFatChart";
import { PRCard } from "../components/PRCard";
import { PhotoComparison } from "../components/PhotoComparison";

export default function ProgressScreen() {
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>PROGRESS</Text>
      <WeightChart />
      <View style={{ height: 16 }} />
      <BodyFatChart />
      <View style={{ height: 16 }} />
      <PRCard lift="Squat" weight="140 kg" date="May 2026" />
      <PhotoComparison />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingTop: 52, paddingBottom: 100 },
  title: { fontFamily: FONTS.black, fontSize: 32, color: COLORS.text, marginBottom: 20 },
});
