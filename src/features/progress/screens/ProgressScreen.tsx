import { useMemo, useState } from "react";
import { useWeightLog } from "@/src/features/nutrition/hooks/useWeight";
import {
  mapApiSessionToHistoryRow,
  fetchWorkoutSessions,
  type ApiWorkoutSession,
} from "@/src/features/workout/services/workout.service";
import { FONTS } from "@/src/ui/tokens/typography";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PRCard } from "../components/PRCard";
import { PhotoComparison } from "../components/PhotoComparison";
import { WeightChart } from "../components/WeightChart";

const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg3: "#222228",
  lime: "#C8F135",
  red: "#FF3D3D",
  text: "#F2F2F5",
  muted: "#4A4A58",
  sub: "#7A7A8C",
  border: "#FFFFFF18",
};

type Period = "7D" | "1M" | "3M" | "ALL";
const PERIODS: Period[] = ["7D", "1M", "3M", "ALL"];

function localYmdFromIso(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function periodCutoffDate(period: Period): Date | null {
  const months =
    period === "7D" ? 0.25 : period === "1M" ? 1 : period === "3M" ? 3 : undefined;
  if (!months) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Math.round(months * 30));
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

function streakFromDays(days: Set<string>, cutoff: Date | null): number {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < 400; i++) {
    if (cutoff && cursor < cutoff) break;
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    const ymd = `${y}-${m}-${d}`;
    if (days.has(ymd)) streak += 1;
    else break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function volumeFromExerciseSets(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  let kg = 0;
  for (const row of raw) {
    if (row && typeof row === "object" && "weight" in row && "reps" in row) {
      const weight = Number((row as { weight?: number }).weight ?? 0);
      const reps = Number((row as { reps?: number }).reps ?? 0);
      kg += weight * reps;
    }
  }
  return kg;
}

function sessionVolumeKg(session: ApiWorkoutSession): number {
  return (session.exercises ?? []).reduce(
    (acc, e) => acc + volumeFromExerciseSets(e.sets),
    0,
  );
}

function startOfWeekSunday(d: Date): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function SectionLabel({
  label,
  icon,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={s.sectionLabelRow}>
      <Ionicons name={icon} size={13} color={T.muted} />
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const [period, setPeriod] = useState<Period>("1M");
  const { data: weightLogs = [] } = useWeightLog();
  const { data: completedWorkouts = [], isPending: workoutsLoading } = useQuery({
    queryKey: ["progress", "workouts"] as const,
    queryFn: () => fetchWorkoutSessions(`?limit=60&completed=true`),
  });

  const periodMonths =
    period === "7D" ? 0.25 : period === "1M" ? 1 : period === "3M" ? 3 : undefined;
  const periodCutoff = useMemo(() => periodCutoffDate(period), [period]);

  const sortedWeights = useMemo(
    () => [...weightLogs].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [weightLogs],
  );

  const periodFilteredWeights = useMemo(() => {
    if (!periodCutoff) return sortedWeights;
    return sortedWeights.filter(
      (w) => new Date(`${w.log_date}T00:00:00`) >= periodCutoff,
    );
  }, [sortedWeights, periodCutoff]);

  const deltaKg =
    periodFilteredWeights.length >= 2
      ? periodFilteredWeights[0].weight -
        periodFilteredWeights[periodFilteredWeights.length - 1].weight
      : null;

  const weightLostLabel =
    deltaKg === null || !Number.isFinite(deltaKg)
      ? "—"
      : `${deltaKg >= 0 ? "−" : "+"}${Math.abs(deltaKg).toFixed(1)} kg`;

  const completedDaySet = useMemo(() => {
    const set = new Set<string>();
    for (const session of completedWorkouts) {
      if (!session.completedAt) continue;
      set.add(localYmdFromIso(session.completedAt));
    }
    return set;
  }, [completedWorkouts]);

  const streakDays = useMemo(
    () => streakFromDays(completedDaySet, periodCutoff),
    [completedDaySet, periodCutoff],
  );

  const sessionsInPeriod = useMemo(() => {
    return completedWorkouts.filter((w) => {
      if (!w.completedAt) return false;
      if (!periodCutoff) return true;
      return new Date(w.completedAt) >= periodCutoff;
    }).length;
  }, [completedWorkouts, periodCutoff]);

  const recentSessions = useMemo(() => {
    return completedWorkouts
      .filter((w) => {
        if (!w.completedAt) return false;
        if (!periodCutoff) return true;
        return new Date(w.completedAt) >= periodCutoff;
      })
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime(),
      )
      .slice(0, 3)
      .map(mapApiSessionToHistoryRow);
  }, [completedWorkouts, periodCutoff]);

  const volumeStats = useMemo(() => {
    const thisWeekStart = startOfWeekSunday(new Date());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisWeekKg = 0;
    let lastWeekKg = 0;
    let thisWeekSessions = 0;
    let lastWeekSessions = 0;

    for (const session of completedWorkouts) {
      if (!session.completedAt) continue;
      const completed = new Date(session.completedAt);
      const vol = sessionVolumeKg(session);

      if (completed >= thisWeekStart) {
        thisWeekKg += vol;
        thisWeekSessions += 1;
      } else if (completed >= lastWeekStart && completed < thisWeekStart) {
        lastWeekKg += vol;
        lastWeekSessions += 1;
      }
    }

    const pctChange =
      lastWeekKg > 0
        ? Math.round(((thisWeekKg - lastWeekKg) / lastWeekKg) * 100)
        : thisWeekKg > 0
          ? 100
          : 0;

    return {
      thisWeekKg,
      lastWeekKg,
      thisWeekSessions,
      lastWeekSessions,
      pctChange,
      hasData: thisWeekKg > 0 || lastWeekKg > 0,
    };
  }, [completedWorkouts]);

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <Text style={s.headerTitle}>PROGRESS</Text>
        <View style={s.headerUnderline} />
      </View>

      <Text style={s.chipGroupLabel}>SHOW DATA FOR</Text>
      <View style={s.chipRow}>
        {PERIODS.map((p) => {
          const active = period === p;
          return (
            <TouchableOpacity
              key={p}
              style={[s.chip, active && s.chipActive]}
              activeOpacity={0.75}
              onPress={() => setPeriod(p)}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.summaryStrip}>
        <View style={s.summaryItem}>
          <Text style={s.summaryVal}>{weightLostLabel}</Text>
          <Text style={s.summaryLabel}>WEIGHT LOST</Text>
        </View>
        <View style={s.summaryDivider} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryVal, { color: T.lime }]}>{streakDays}</Text>
          <Text style={s.summaryLabel}>STREAK</Text>
        </View>
        <View style={s.summaryDivider} />
        <View style={s.summaryItem}>
          {workoutsLoading ? (
            <ActivityIndicator
              color={T.lime}
              size="small"
              style={{ marginBottom: 4 }}
            />
          ) : (
            <Text style={[s.summaryVal, { color: T.lime }]}>
              {sessionsInPeriod}
            </Text>
          )}
          <Text style={s.summaryLabel}>WORKOUTS</Text>
        </View>
      </View>

      <SectionLabel label="WEIGHT TREND" icon="trending-down-outline" />
      <WeightChart periodMonths={periodMonths} />

      <SectionLabel label="VOLUME" icon="barbell-outline" />
      {volumeStats.hasData ? (
        <View style={s.volumeSection}>
          <View style={s.volumeRow}>
            <View style={s.volumeCard}>
              <Text style={s.volumeCardLabel}>THIS WEEK</Text>
              <Text style={s.volumeCardValue}>
                {Math.round(volumeStats.thisWeekKg).toLocaleString()} kg
              </Text>
              <Text style={s.volumeCardSub}>
                {volumeStats.thisWeekSessions} session
                {volumeStats.thisWeekSessions === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={s.volumeCard}>
              <Text style={s.volumeCardLabel}>LAST WEEK</Text>
              <Text style={s.volumeCardValue}>
                {Math.round(volumeStats.lastWeekKg).toLocaleString()} kg
              </Text>
              <Text style={s.volumeCardSub}>
                {volumeStats.lastWeekSessions} session
                {volumeStats.lastWeekSessions === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
          {volumeStats.thisWeekKg !== volumeStats.lastWeekKg ? (
            <Text
              style={[
                s.volumeDelta,
                {
                  color:
                    volumeStats.thisWeekKg > volumeStats.lastWeekKg
                      ? T.lime
                      : T.red,
                },
              ]}
            >
              {volumeStats.thisWeekKg > volumeStats.lastWeekKg ? "↑" : "↓"}{" "}
              {Math.abs(volumeStats.pctChange)}%{" "}
              {volumeStats.thisWeekKg > volumeStats.lastWeekKg ? "more" : "less"}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={s.emptyCard}>
          <Text style={s.emptyBody}>
            Complete a workout to see volume stats
          </Text>
        </View>
      )}

      <SectionLabel label="PROGRESS PHOTOS" icon="camera-outline" />
      <PhotoComparison />

      <SectionLabel label="RECENT WORKOUTS" icon="time-outline" />
      {recentSessions.length === 0 ? (
        <Text style={s.prEmpty}>No completed workouts yet.</Text>
      ) : (
        recentSessions.map((pr) => (
          <PRCard
            key={pr.id}
            name={pr.name}
            date={pr.date}
            duration={pr.duration}
            sets={pr.sets}
          />
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.bg0,
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
  },
  content: {
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: 110,
  },

  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 52,
    color: T.text,
    letterSpacing: 0.3,
    lineHeight: 54,
  },
  headerUnderline: {
    marginTop: 4,
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: T.lime,
  },

  chipGroupLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: T.muted,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: T.border,
  },
  chipActive: {
    backgroundColor: T.lime,
    borderColor: T.lime,
  },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: T.muted,
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: T.bg0,
  },

  summaryStrip: {
    flexDirection: "row",
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: T.border,
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
    backgroundColor: T.border,
    alignSelf: "center",
  },
  summaryVal: {
    fontFamily: FONTS.black,
    fontSize: 18,
    color: T.text,
    letterSpacing: -0.4,
  },
  summaryLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.5,
  },

  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: T.muted,
    letterSpacing: 1.4,
  },

  emptyCard: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    padding: 28,
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: T.text,
    letterSpacing: 0.2,
  },
  emptyBody: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: T.muted,
    textAlign: "center",
  },
  emptyBtn: {
    backgroundColor: T.lime,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 4,
  },
  emptyBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: T.bg0,
    letterSpacing: 0.5,
  },

  volumeSection: {
    marginBottom: 8,
  },
  volumeRow: {
    flexDirection: "row",
    gap: 10,
  },
  volumeCard: {
    flex: 1,
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    padding: 16,
    gap: 4,
  },
  volumeCardLabel: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.5,
  },
  volumeCardValue: {
    fontFamily: FONTS.black,
    fontSize: 20,
    color: T.text,
    letterSpacing: -0.3,
  },
  volumeCardSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: T.sub,
  },
  volumeDelta: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    letterSpacing: 0.3,
  },

  prEmpty: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: T.muted,
    paddingVertical: 8,
    marginBottom: 6,
  },
});
