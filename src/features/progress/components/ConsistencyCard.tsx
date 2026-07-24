import React from "react";
import { View, Text, StyleSheet } from "react-native";

const T = {
  panel: "#15161C",
  panelBorder: "rgba(255,255,255,0.08)",
  accent: "#FFC700",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  track: "rgba(255,255,255,0.08)",
  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
};

interface Props {
  completedThisWeek: number;
  targetPerWeek: number;
}

export function ConsistencyCard({ completedThisWeek, targetPerWeek }: Props) {
  const pct =
    targetPerWeek > 0 ? Math.min(1, completedThisWeek / targetPerWeek) : 0;

  return (
    <View style={s.card}>
      <View style={s.row}>
        <Text style={s.label}>THIS WEEK</Text>
        <Text style={s.count}>
          {completedThisWeek}
          <Text style={s.countDim}> / {targetPerWeek} sessions</Text>
        </Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: T.panel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontFamily: T.bodyMed,
    fontSize: 10,
    letterSpacing: 1.2,
    color: T.muted,
  },
  count: { fontFamily: T.display, fontSize: 15, color: T.white },
  countDim: { fontFamily: T.bodyMed, fontSize: 12, color: T.muted },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: T.track,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: T.accent, borderRadius: 3 },
});
