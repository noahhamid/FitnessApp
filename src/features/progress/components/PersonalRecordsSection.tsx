import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Award } from "lucide-react-native";
import type { PersonalRecord } from "../hooks/useProgress";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";

interface Props {
  records: PersonalRecord[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function PersonalRecordsSection({ records }: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);

  if (records.length === 0) {
    return (
      <GlassSurface style={s.emptyCard}>
        <View style={s.iconWrap}>
          <Award size={20} color={T.accent} strokeWidth={2.2} />
        </View>
        <Text style={s.emptyTitle}>No records yet</Text>
        <Text style={s.emptyText}>
          Your heaviest lifts will show up here after a few logged workouts.
        </Text>
      </GlassSurface>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {records.map((r) => (
        <GlassSurface key={r.exerciseName} style={s.card}>
          <View style={s.iconWrap}>
            <Award size={18} color={T.accent} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1, zIndex: 1 }}>
            <Text style={s.exerciseName}>{r.exerciseName}</Text>
            <Text style={s.subtext}>
              {r.heaviestWeight}kg × {r.repsAtHeaviest} · est. 1RM{" "}
              {r.estimatedOneRepMax}kg
            </Text>
          </View>
          <Text style={s.dateText}>{formatDate(r.achievedAt)}</Text>
        </GlassSurface>
      ))}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: T.radius.md,
      padding: 14,
      gap: T.space.md,
    },
    emptyCard: {
      alignItems: "center",
      borderRadius: T.radius.lg,
      paddingVertical: 36,
      paddingHorizontal: 20,
      gap: 8,
    },
    emptyTitle: {
      fontFamily: T.displaySemi,
      fontSize: 16,
      color: T.white,
      zIndex: 1,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    exerciseName: { fontFamily: T.bodySemi, fontSize: 14, color: T.white },
    subtext: {
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      color: T.muted,
      marginTop: 2,
    },
    dateText: { fontFamily: T.bodyMed, fontSize: 11, color: T.muted, zIndex: 1 },
    emptyText: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.muted,
      lineHeight: 19,
      textAlign: "center",
      zIndex: 1,
    },
  });
}
