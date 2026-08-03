import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Award } from "lucide-react-native";
import type { PersonalRecord } from "../hooks/useProgress";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

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
      <View style={s.card}>
        <Text style={s.emptyText}>
          Your personal records will show up here once you've logged a few
          workouts.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {records.map((r) => (
        <View key={r.exerciseName} style={s.card}>
          <View style={s.iconWrap}>
            <Award size={18} color={T.accent} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.exerciseName}>{r.exerciseName}</Text>
            <Text style={s.subtext}>
              {r.heaviestWeight}kg × {r.repsAtHeaviest} · est. 1RM{" "}
              {r.estimatedOneRepMax}kg
            </Text>
          </View>
          <Text style={s.dateText}>{formatDate(r.achievedAt)}</Text>
        </View>
      ))}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: T.glass,
      borderRadius: T.radius.md,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
      padding: 14,
      gap: T.space.md,
      ...T.shadow.card,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
    },
    exerciseName: { fontFamily: T.bodySemi, fontSize: 14, color: T.white },
    subtext: {
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      color: T.muted,
      marginTop: 2,
    },
    dateText: { fontFamily: T.bodyMed, fontSize: 11, color: T.muted },
    emptyText: {
      fontFamily: T.bodyMed,
      fontSize: 12.5,
      color: T.muted,
      lineHeight: 18,
      textAlign: "center",
    },
  });
}
