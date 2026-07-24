import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Award } from "lucide-react-native";
import type { PersonalRecord } from "../hooks/useProgress";

const T = {
  panel: "#15161C",
  panelBorder: "rgba(255,255,255,0.08)",
  accent: "#FFC700",
  accentGlass: "rgba(255,199,0,0.10)",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
};

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

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.accentGlass,
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
