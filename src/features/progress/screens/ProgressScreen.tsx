import { useMemo } from "react";
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { useWeightLog } from "@/src/features/nutrition/hooks/useWeight";
import {
  mapApiSessionToHistoryRow,
  fetchWorkoutSessions,
} from "@/src/features/workout/services/workout.service";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
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

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionLabel}>{label}</Text>
      {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
    </View>
  );
}

export default function ProgressScreen() {
  const { data: weightLogs = [] } = useWeightLog();
  const { data: completedWorkouts = [], isPending: workoutsLoading } = useQuery({
    queryKey: ["progress", "workouts"] as const,
    queryFn: () => fetchWorkoutSessions(`?limit=60&completed=true`),
  });

  const sortedWeights = useMemo(
    () => [...weightLogs].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [weightLogs],
  );

  const deltaKg =
    sortedWeights.length >= 2
      ? sortedWeights[0].weight - sortedWeights[sortedWeights.length - 1].weight
      : null;

  const weightLostLabel =
    deltaKg === null || !Number.isFinite(deltaKg)
      ? "—"
      : `${deltaKg >= 0 ? "−" : "+"}${Math.abs(deltaKg).toFixed(1)} kg`;

  const ymNow = useMemo(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const sessionsThisMonth = useMemo(
    () =>
      completedWorkouts.filter(
        (w) => w.completedAt && w.completedAt.slice(0, 7) === ymNow,
      ).length,
    [completedWorkouts, ymNow],
  );

  const recentSessions = useMemo(() => {
    const rows = completedWorkouts
      .filter((w) => w.completedAt != null)
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime(),
      )
      .slice(0, 3)
      .map(mapApiSessionToHistoryRow);
    return rows;
  }, [completedWorkouts]);

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
          <Text style={s.summaryVal}>{weightLostLabel}</Text>
          <Text style={s.summaryLabel}>WEIGHT LOST</Text>
        </View>
        <View style={s.summaryDivider} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryVal, { color: COLORS.blue }]}>—</Text>
          <Text style={s.summaryLabel}>BODY FAT</Text>
        </View>
        <View style={s.summaryDivider} />
        <View style={s.summaryItem}>
          {workoutsLoading ? (
            <ActivityIndicator
              color={COLORS.accent}
              size="small"
              style={{ marginBottom: 4 }}
            />
          ) : (
            <Text style={[s.summaryVal, { color: COLORS.accent }]}>
              {sessionsThisMonth}
            </Text>
          )}
          <Text style={s.summaryLabel}>THIS MONTH</Text>
        </View>
      </View>

      {/* Body metrics */}
      <SectionHeader label="BODY METRICS" sub="Last 7 months" />
      <WeightChart />
      <View style={s.gap} />
      <BodyFatChart />

      <SectionHeader label="PERSONAL RECORDS" sub="Latest completed sessions" />
      {recentSessions.length === 0 ? (
        <Text style={s.prEmpty}>No completed workouts yet.</Text>
      ) : (
        recentSessions.map((pr) => {
          const vol = Number(pr.volume.replace(/[^0-9.]/g, "")) || 0;
          return (
            <PRCard
              key={pr.id}
              lift={pr.name}
              weight={vol ? String(Math.round(vol)) : "0"}
              date={pr.date}
            />
          );
        })
      )}

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
  prEmpty: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.muted,
    paddingVertical: 8,
    marginBottom: 6,
  },
});
