import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp } from "lucide-react-native";
import type { ProgressionSuggestion } from "../hooks/useProgress";

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
  suggestions: ProgressionSuggestion[];
}

export function LevelUpSection({ suggestions }: Props) {
  const readyToLevelUp = suggestions.filter((s) => s.direction === "increase");

  if (readyToLevelUp.length === 0) {
    return (
      <View style={s.card}>
        <Text style={s.emptyText}>
          Keep logging your sets — you'll see suggestions here once you're
          consistently hitting your target reps.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {readyToLevelUp.map((sug) => (
        <View key={sug.exerciseName} style={s.card}>
          <View style={s.iconWrap}>
            <TrendingUp size={18} color={T.accent} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.exerciseName}>{sug.exerciseName}</Text>
            <Text style={s.subtext}>
              You hit your target reps every set last time
            </Text>
          </View>
          <View style={s.weightWrap}>
            <Text style={s.oldWeight}>{sug.lastWeight} kg</Text>
            <Text style={s.arrow}>→</Text>
            <Text style={s.newWeight}>{sug.suggestedWeight} kg</Text>
          </View>
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
  weightWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  oldWeight: { fontFamily: T.bodyMed, fontSize: 12, color: T.muted },
  arrow: { color: T.muted, fontSize: 12 },
  newWeight: { fontFamily: T.display, fontSize: 14, color: T.accent },
  emptyText: {
    fontFamily: T.bodyMed,
    fontSize: 12.5,
    color: T.muted,
    lineHeight: 18,
    textAlign: "center",
  },
});
