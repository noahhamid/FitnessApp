import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { TrendingUp } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { PressableScale } from "./PressableScale";

type Props = {
  explanation: string;
  currentCalories: number;
  suggestedCalories: number;
  delta: number;
  accepting: boolean;
  onAccept: () => void;
  /** Shown after a 409 stale rejection while refetching. */
  staleNotice?: string | null;
};

export function AdaptiveSuggestionCard({
  explanation,
  currentCalories,
  suggestedCalories,
  delta,
  accepting,
  onAccept,
  staleNotice,
}: Props) {
  const { T, styles } = useThemedStyles(makeStyles);
  const signedDelta = delta > 0 ? `+${delta}` : `${delta}`;

  return (
    <GlassSurface style={styles.wrap}>
      <View style={styles.eyebrowRow}>
        <TrendingUp size={13} color={T.accent} strokeWidth={2.2} />
        <Text style={styles.eyebrow}>WEIGHT TREND</Text>
      </View>
      <Text style={styles.title}>Adjust your calorie target?</Text>
      <Text style={styles.body}>{explanation}</Text>
      <View style={styles.targetsRow}>
        <Text style={styles.targetMeta}>
          {currentCalories} → {suggestedCalories} kcal
        </Text>
        <Text style={styles.delta}>{signedDelta} / day</Text>
      </View>
      {staleNotice ? (
        <Text style={styles.stale}>{staleNotice}</Text>
      ) : null}
      <PressableScale
        onPress={onAccept}
        disabled={accepting}
        style={[styles.acceptPressable, accepting && styles.acceptDisabled]}
      >
        <View style={styles.acceptBtn}>
          {accepting ? (
            <ActivityIndicator size="small" color={T.onAccent} />
          ) : (
            <Text style={styles.acceptText}>Accept new target</Text>
          )}
        </View>
      </PressableScale>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 8,
    },
    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    eyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 10.5,
      letterSpacing: 1,
      color: T.accent,
    },
    title: {
      fontFamily: T.display,
      fontSize: 17,
      color: T.white,
      letterSpacing: -0.2,
    },
    body: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      lineHeight: 19,
      color: T.muted,
    },
    targetsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    targetMeta: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.white,
    },
    delta: {
      fontFamily: T.bodyBold,
      fontSize: 13,
      color: T.accent,
    },
    stale: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.badge,
      marginTop: 2,
    },
    acceptPressable: { borderRadius: 14, marginTop: 6 },
    acceptDisabled: { opacity: 0.55 },
    acceptBtn: {
      backgroundColor: T.accent,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
    },
    acceptText: {
      fontFamily: T.bodyBold,
      fontSize: 13.5,
      color: T.onAccent,
    },
  });
}
