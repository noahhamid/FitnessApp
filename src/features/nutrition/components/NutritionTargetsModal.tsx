import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import type { NutritionGoals } from "../types/nutrition.types";
import { goalLabel } from "@/src/features/auth/services/goals.service";

type Props = {
  visible: boolean;
  onClose: () => void;
  goals: NutritionGoals | null;
  goalId: string | null | undefined;
  daysPerWeek: number | null | undefined;
};

function Row({ label, value }: { label: string; value: string }) {
  const { styles } = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function NutritionTargetsModal({
  visible,
  onClose,
  goals,
  goalId,
  daysPerWeek,
}: Props) {
  const { T, styles } = useThemedStyles(makeStyles);

  const hasBmrTdee = !!goals && goals.bmr > 0 && goals.tdee > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Your nutrition targets</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <X size={18} color={T.muted} strokeWidth={2.2} />
            </Pressable>
          </View>

          <Text style={styles.body}>
            These targets are calculated from your profile (weight, height, age,
            gender, training days, and goal). They’re not edited by hand — update
            your profile to recalculate.
          </Text>

          {goals ? (
            <View style={styles.card}>
              <Row label="Goal" value={goalLabel(goalId)} />
              {daysPerWeek != null && (
                <Row
                  label="Training days"
                  value={`${daysPerWeek} / week`}
                />
              )}
              <Row label="Daily calories" value={`${goals.calories} kcal`} />
              <Row label="Protein" value={`${goals.protein} g`} />
              <Row label="Carbs" value={`${goals.carbs} g`} />
              <Row label="Fat" value={`${goals.fat} g`} />
              {hasBmrTdee && (
                <>
                  <View style={styles.divider} />
                  <Row label="BMR" value={`${goals.bmr} kcal`} />
                  <Row label="TDEE (maintenance)" value={`${goals.tdee} kcal`} />
                </>
              )}
            </View>
          ) : (
            <Text style={styles.empty}>
              No targets yet. Finish your profile setup to generate them.
            </Text>
          )}

          {hasBmrTdee && (
            <Text style={styles.footnote}>
              BMR uses Mifflin–St Jeor. TDEE scales BMR by your weekly training
              days. Your daily calorie target adjusts TDEE for your selected
              goal.
            </Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: T.bgElevated,
      borderTopLeftRadius: T.radius.xl,
      borderTopRightRadius: T.radius.xl,
      paddingHorizontal: T.space.xl,
      paddingTop: T.space.sm,
      paddingBottom: 40,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
    },
    handle: {
      alignSelf: "center",
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: T.border,
      marginBottom: T.space.lg,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: T.space.md,
    },
    title: {
      fontFamily: T.displaySemi,
      fontSize: 18,
      color: T.white,
      letterSpacing: -0.3,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.muted,
      lineHeight: 19,
      marginBottom: T.space.lg,
    },
    card: {
      backgroundColor: T.bg,
      borderRadius: T.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
      paddingHorizontal: T.space.lg,
      paddingVertical: 4,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    rowLabel: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.muted,
    },
    rowValue: {
      fontFamily: T.bodySemi,
      fontSize: 14,
      color: T.white,
      fontVariant: ["tabular-nums"],
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: T.glassBorder,
      marginVertical: 4,
    },
    empty: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.muted,
      lineHeight: 19,
    },
    footnote: {
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      color: T.faint,
      lineHeight: 17,
      marginTop: T.space.lg,
    },
  });
}
