import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BodyFatChart } from "../components/BodyFatChart";
import { PRCard } from "../components/PRCard";
import { PhotoComparison } from "../components/PhotoComparison";
import { WeightChart } from "../components/WeightChart";

const PR_DATA = [
  { lift: "Squat", weight: "140", date: "May 12, 2026", prev: "132.5" },
  { lift: "Bench Press", weight: "102.5", date: "May 8, 2026", prev: "97.5" },
  { lift: "Deadlift", weight: "180", date: "Apr 30, 2026", prev: "172.5" },
];

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionLabel}>{label}</Text>
      {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
    </View>
  );
}

export default function ProgressScreen() {
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Page header */}
      <View style={s.pageHeader}>
        <View>
          <Text style={s.eyebrow}>OVERVIEW</Text>
          <Text style={s.title}>Progress</Text>
        </View>
        <TouchableOpacity style={s.periodPill} activeOpacity={0.7}>
          <Text style={s.periodText}>7 months ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={s.summaryStrip}>
        <View style={s.summaryItem}>
          <Text style={s.summaryVal}>−5.7 kg</Text>
          <Text style={s.summaryLabel}>WEIGHT LOST</Text>
        </View>
        <View style={s.summaryDivider} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryVal, { color: COLORS.blue }]}>−3.8%</Text>
          <Text style={s.summaryLabel}>BODY FAT</Text>
        </View>
        <View style={s.summaryDivider} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryVal, { color: COLORS.accent }]}>3 PRs</Text>
          <Text style={s.summaryLabel}>THIS MONTH</Text>
        </View>
      </View>

      {/* Body metrics */}
      <SectionHeader label="BODY METRICS" sub="Last 7 months" />
      <WeightChart />
      <View style={s.gap} />
      <BodyFatChart />

      {/* Personal records */}
      <SectionHeader label="PERSONAL RECORDS" sub="All-time bests" />
      {PR_DATA.map((pr) => (
        <PRCard
          key={pr.lift}
          lift={pr.lift}
          weight={pr.weight}
          date={pr.date}
          prev={pr.prev}
        />
      ))}

      {/* Photo comparison */}
      <SectionHeader label="TRANSFORMATION" sub="Side-by-side comparison" />
      <PhotoComparison />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 110,
  },

  // Page header
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  eyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 34,
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  periodPill: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  periodText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.text,
    letterSpacing: 0.2,
  },

  // Summary strip
  summaryStrip: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 28,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    alignSelf: "center",
  },
  summaryVal: {
    fontFamily: FONTS.black,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  summaryLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1.5,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 2,
  },
  sectionSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    opacity: 0.5,
  },

  gap: { height: 12 },
});
