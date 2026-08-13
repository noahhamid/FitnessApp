import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, Repeat, TrendingDown } from "lucide-react-native";
import type {
  ProgressionDirection,
  ProgressionSuggestion,
} from "../hooks/useProgress";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

interface Props {
  suggestions: ProgressionSuggestion[];
}

const ACTIONABLE: ProgressionDirection[] = ["increase", "add_reps", "deload"];

const ICON: Record<string, typeof TrendingUp> = {
  increase: TrendingUp,
  add_reps: Repeat,
  deload: TrendingDown,
};

function subtextFor(sug: ProgressionSuggestion): string {
  if (sug.direction === "increase") {
    return "You hit the top of your rep range every set";
  }
  if (sug.direction === "deload") {
    return "Reps fell under target — back off the load and rebuild";
  }
  return sug.suggestedReps != null
    ? `Same weight, chase ${sug.suggestedReps} reps this time`
    : "Same weight, add a rep this time";
}

export function LevelUpSection({ suggestions }: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const actionable = suggestions.filter((sug) =>
    ACTIONABLE.includes(sug.direction),
  );

  if (actionable.length === 0) {
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
      {actionable.map((sug) => {
        const Icon = ICON[sug.direction] ?? TrendingUp;
        const loadChanged =
          sug.suggestedWeight != null &&
          sug.lastWeight != null &&
          sug.suggestedWeight !== sug.lastWeight;

        return (
          <View key={sug.exerciseName} style={s.card}>
            <View
              style={[
                s.iconWrap,
                sug.direction === "deload" && s.iconWrapQuiet,
              ]}
            >
              <Icon
                size={18}
                color={sug.direction === "deload" ? T.muted : T.accent}
                strokeWidth={2.2}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.exerciseName}>{sug.exerciseName}</Text>
              <Text style={s.subtext}>{subtextFor(sug)}</Text>
            </View>
            {loadChanged ? (
              <View style={s.weightWrap}>
                <Text style={s.oldWeight}>{sug.lastWeight} kg</Text>
                <Text style={s.arrow}>→</Text>
                <Text style={s.newWeight}>{sug.suggestedWeight} kg</Text>
              </View>
            ) : (
              <View style={s.weightWrap}>
                <Text style={s.newWeight}>
                  {sug.suggestedReps != null ? `${sug.suggestedReps} reps` : "—"}
                </Text>
              </View>
            )}
          </View>
        );
      })}
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
    iconWrapQuiet: {
      backgroundColor: T.border,
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
    newWeight: { fontFamily: T.displaySemi, fontSize: 14, color: T.accent },
    emptyText: {
      fontFamily: T.bodyMed,
      fontSize: 12.5,
      color: T.muted,
      lineHeight: 18,
      textAlign: "center",
    },
  });
}
