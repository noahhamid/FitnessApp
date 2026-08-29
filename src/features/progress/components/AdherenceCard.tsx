import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalendarCheck } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import type { WorkoutSessionSummary } from "../hooks/useProgress";
import { completedDayKeys, trainingAdherence } from "../lib/analytics";

type Props = {
  sessions: WorkoutSessionSummary[];
  daysPerWeek: number;
  trainingDays?: readonly number[] | null;
};

export function AdherenceCard({ sessions, daysPerWeek, trainingDays }: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);

  const stats = useMemo(() => {
    const days = completedDayKeys(sessions);
    return trainingAdherence(daysPerWeek, days, 4, trainingDays);
  }, [sessions, daysPerWeek, trainingDays]);

  const pct = Math.round(stats.rate * 100);

  return (
    <GlassSurface style={s.card}>
      <Text style={s.eyebrow}>SCHEDULE ADHERENCE · 4 WEEKS</Text>
      <View style={s.top}>
        <View style={s.iconWrap}>
          <CalendarCheck size={20} color={T.accent} strokeWidth={2.2} />
        </View>
        <View style={s.topText}>
          <Text style={s.fraction}>
            {stats.completed}
            <Text style={s.fractionOf}>/{stats.scheduled}</Text>
          </Text>
          <Text style={s.fractionLabel}>scheduled training days hit</Text>
        </View>
        <Text style={s.pct}>{stats.scheduled === 0 ? "—" : `${pct}%`}</Text>
      </View>

      <View style={s.track}>
        <View
          style={[
            s.fill,
            {
              width:
                stats.scheduled === 0
                  ? "0%"
                  : `${Math.min(100, Math.max(0, pct))}%`,
            },
          ]}
        />
      </View>

      <Text style={s.sub}>
        Based on your {daysPerWeek}-day/week plan. Rest-day sessions aren&apos;t
        counted against you — this only tracks whether scheduled train days
        were completed.
      </Text>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.lg,
      padding: T.space.lg,
    },
    eyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 0.8,
      color: T.muted,
      marginBottom: 14,
      zIndex: 1,
    },
    top: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      zIndex: 1,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: T.ringGlass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.ringBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    topText: { flex: 1 },
    fraction: {
      fontFamily: T.displayBold,
      fontSize: 28,
      color: T.white,
      letterSpacing: -0.5,
      fontVariant: ["tabular-nums"],
    },
    fractionOf: {
      fontFamily: T.displaySemi,
      fontSize: 18,
      color: T.muted,
    },
    fractionLabel: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
      marginTop: 2,
    },
    pct: {
      fontFamily: T.displaySemi,
      fontSize: 18,
      color: T.accent,
      fontVariant: ["tabular-nums"],
    },
    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: T.accentTint,
      overflow: "hidden",
      marginTop: 16,
      zIndex: 1,
    },
    fill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: T.accent,
    },
    sub: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
      lineHeight: 17,
      marginTop: 12,
      zIndex: 1,
    },
  });
}
