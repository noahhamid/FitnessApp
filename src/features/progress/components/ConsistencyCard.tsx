import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

interface Props {
  completedThisWeek: number;
  targetPerWeek: number;
}

export function ConsistencyCard({ completedThisWeek, targetPerWeek }: Props) {
  const { styles: s } = useThemedStyles(makeStyles);
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

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: T.glass,
      borderRadius: T.radius.lg,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
      padding: T.space.lg,
      ...T.shadow.card,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    label: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 1.2,
      color: T.muted,
      textTransform: "uppercase",
    },
    count: { fontFamily: T.displaySemi, fontSize: 15, color: T.white },
    countDim: { fontFamily: T.bodyMed, fontSize: 12, color: T.muted },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: T.accentTint,
      overflow: "hidden",
    },
    fill: { height: "100%", backgroundColor: T.accent, borderRadius: 3 },
  });
}
