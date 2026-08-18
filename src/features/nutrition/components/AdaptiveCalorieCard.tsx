import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { PressableScale } from "./PressableScale";

type Props = {
  currentCalories: number;
  suggestedCalories: number;
  explanation: string;
  applying: boolean;
  error?: boolean;
  onApply: () => void;
  onDismiss: () => void;
};

export function AdaptiveCalorieCard({
  currentCalories,
  suggestedCalories,
  explanation,
  applying,
  error,
  onApply,
  onDismiss,
}: Props) {
  const { styles } = useThemedStyles(makeStyles);
  const delta = suggestedCalories - currentCalories;
  const verb = delta > 0 ? "raise" : "lower";

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>WEIGHT TREND</Text>
      <Text style={styles.title}>
        {verb[0].toUpperCase() + verb.slice(1)} your daily target to{" "}
        {suggestedCalories} kcal
      </Text>
      <Text style={styles.body}>{explanation}</Text>
      <Text style={styles.delta}>
        {currentCalories} → {suggestedCalories} kcal
      </Text>
      {error ? (
        <Text style={styles.error}>Couldn’t update targets — try again.</Text>
      ) : null}
      <View style={styles.row}>
        <PressableScale
          onPress={onDismiss}
          disabled={applying}
          style={styles.ghostPressable}
        >
          <View style={styles.ghostBtn}>
            <Text style={styles.ghostText}>Not now</Text>
          </View>
        </PressableScale>
        <PressableScale
          onPress={onApply}
          disabled={applying}
          style={styles.applyPressable}
        >
          <View style={styles.applyBtn}>
            <Text style={styles.applyText}>
              {applying ? "Updating…" : "Update target"}
            </Text>
          </View>
        </PressableScale>
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: T.glass,
      borderRadius: 22,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
      padding: 18,
      gap: 6,
    },
    eyebrow: {
      fontFamily: T.bodySemi,
      fontSize: 10.5,
      letterSpacing: 0.8,
      color: T.accent,
    },
    title: {
      fontFamily: T.displaySemi,
      fontSize: 17,
      color: T.white,
      letterSpacing: -0.3,
      lineHeight: 22,
    },
    body: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.muted,
      lineHeight: 19,
    },
    delta: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.white,
      fontVariant: ["tabular-nums"],
      marginTop: 4,
    },
    error: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.badge,
      marginTop: 4,
    },
    row: { flexDirection: "row", gap: 10, marginTop: 10 },
    ghostPressable: { flex: 1, borderRadius: 15 },
    ghostBtn: {
      borderRadius: 15,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: T.bg,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
    },
    ghostText: { fontFamily: T.bodySemi, fontSize: 13, color: T.white },
    applyPressable: { flex: 1, borderRadius: 15 },
    applyBtn: {
      borderRadius: 15,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: T.accent,
    },
    applyText: { fontFamily: T.bodyBold, fontSize: 13, color: T.onAccent },
  });
}
