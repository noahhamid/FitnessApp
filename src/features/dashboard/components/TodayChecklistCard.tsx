import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import {
  CheckCircle2,
  MinusCircle,
  Dumbbell,
  Coffee,
  UtensilsCrossed,
  Moon,
  Droplet,
  Minus,
  Plus,
  type LucideProps,
} from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import { useTheme } from "@/src/context/ThemeContext";
import type { AppTheme } from "@/src/theme";
import { PressableScale } from "./PressableScale";
import { GlassSurface } from "./GlassSurface";

export type ChecklistDayKind = "today" | "past" | "future";
type StepKey = "workout" | "breakfast" | "lunch" | "dinner";

type Props = {
  dayKind: ChecklistDayKind;
  workoutDone: boolean;
  breakfastDone: boolean;
  lunchDone: boolean;
  dinnerDone: boolean;
  waterGlasses: number;
  waterTotal?: number;
  onStepPress?: () => void;
  onWaterAdjust?: (delta: number) => void;
  isLoading?: boolean;
};

const STEPS: StepKey[] = ["workout", "breakfast", "lunch", "dinner"];

const STEP_LABEL: Record<StepKey, string> = {
  workout: "Workout",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const STEP_ICON: Record<StepKey, React.ComponentType<LucideProps>> = {
  workout: Dumbbell,
  breakfast: Coffee,
  lunch: UtensilsCrossed,
  dinner: Moon,
};

const STEP_SEMANTIC = {
  breakfast: {
    light: { bg: "rgba(232,140,60,0.16)", border: "rgba(232,140,60,0.32)", icon: "#D4842A" },
    dark: { bg: "rgba(255,170,80,0.20)", border: "rgba(255,170,80,0.36)", icon: "#FFB35C" },
  },
  lunch: {
    light: { bg: "rgba(46,150,90,0.14)", border: "rgba(46,150,90,0.30)", icon: "#2A8F52" },
    dark: { bg: "rgba(80,220,140,0.18)", border: "rgba(80,220,140,0.34)", icon: "#5EE09A" },
  },
  dinner: {
    light: { bg: "rgba(80,90,190,0.14)", border: "rgba(80,90,190,0.30)", icon: "#4A55B0" },
    dark: { bg: "rgba(130,145,255,0.18)", border: "rgba(130,145,255,0.34)", icon: "#9AA6FF" },
  },
} as const;

const WATER = {
  light: { bg: "rgba(64,140,230,0.14)", border: "rgba(64,140,230,0.28)", icon: "#2F7FD4" },
  dark: { bg: "rgba(70,150,255,0.18)", border: "rgba(70,150,255,0.32)", icon: "#6BA8FF" },
} as const;

type WellColors = { bg: string; border: string; icon: string };

function stepWellColors(
  key: StepKey,
  resolved: "light" | "dark",
  T: AppTheme,
): WellColors {
  if (key === "workout") {
    return { bg: T.accentTint, border: T.accentLine, icon: T.accent };
  }
  return STEP_SEMANTIC[key][resolved];
}

export function nextChecklistAction(input: {
  workoutDone: boolean;
  breakfastDone: boolean;
  lunchDone: boolean;
  dinnerDone: boolean;
  isRestDay?: boolean;
}): { key: StepKey | "complete"; label: string } {
  if (!input.workoutDone && !input.isRestDay) {
    return { key: "workout", label: "Start workout" };
  }
  if (!input.breakfastDone) return { key: "breakfast", label: "Log breakfast" };
  if (!input.lunchDone) return { key: "lunch", label: "Log lunch" };
  if (!input.dinnerDone) return { key: "dinner", label: "Log dinner" };
  return { key: "complete", label: "Day complete" };
}

export function TodayChecklistCard({
  dayKind,
  workoutDone,
  breakfastDone,
  lunchDone,
  dinnerDone,
  waterGlasses,
  waterTotal = 8,
  onStepPress,
  onWaterAdjust,
  isLoading,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const { resolved } = useTheme();
  const waterColors = WATER[resolved];

  const doneMap: Record<StepKey, boolean> = {
    workout: workoutDone,
    breakfast: breakfastDone,
    lunch: lunchDone,
    dinner: dinnerDone,
  };
  const complete = workoutDone && breakfastDone && lunchDone && dinnerDone;
  const currentStep: StepKey | null = STEPS.find((k) => !doneMap[k]) ?? null;
  const isActionable = dayKind === "today" && !complete && !isLoading;

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isActionable) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, isActionable]);

  let headline: string;
  if (isLoading) headline = "Checking today’s progress…";
  else if (complete) headline = "Today’s checklist done";
  else if (dayKind === "future") headline = "Not started yet";
  else if (dayKind === "past") headline = "Missed checklist";
  else headline = "Today’s checklist";

  return (
    <GlassSurface style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.headline}>{headline}</Text>
        {complete && !isLoading ? (
          <CheckCircle2 size={16} color={T.accent} strokeWidth={2.2} />
        ) : dayKind === "past" && !complete ? (
          <MinusCircle size={16} color={T.faint} strokeWidth={2.2} />
        ) : null}
      </View>

      <View style={s.steps}>
        {STEPS.map((key) => {
          const done = doneMap[key];
          const colors = stepWellColors(key, resolved, T);
          const StepIcon = STEP_ICON[key];
          const isFocus = isActionable && currentStep === key;
          const row = (
            <Animated.View
              style={[
                s.stepRow,
                done && s.stepRowDone,
                isFocus && { transform: [{ scale: pulse }] },
              ]}
            >
              <View
                style={[
                  s.stepWell,
                  done
                    ? { backgroundColor: colors.bg, borderColor: colors.border }
                    : s.stepWellPending,
                ]}
              >
                <StepIcon
                  size={13}
                  color={done ? colors.icon : T.faint}
                  strokeWidth={2.2}
                />
              </View>
              <Text style={[s.stepLabel, done && s.stepLabelDone]}>
                {STEP_LABEL[key]}
              </Text>
              {done ? (
                <CheckCircle2 size={14} color={T.accent} strokeWidth={2.2} />
              ) : (
                <View style={s.openDot} />
              )}
            </Animated.View>
          );

          if (isFocus && onStepPress) {
            return (
              <PressableScale
                key={key}
                onPress={onStepPress}
                scaleTo={0.98}
                style={s.stepPress}
              >
                {row}
              </PressableScale>
            );
          }
          return <View key={key}>{row}</View>;
        })}
      </View>

      <View style={s.waterRow}>
        <View
          style={[
            s.stepWell,
            {
              backgroundColor: waterColors.bg,
              borderColor: waterColors.border,
            },
          ]}
        >
          <Droplet size={13} color={waterColors.icon} strokeWidth={2.2} />
        </View>
        <View style={s.waterCopy}>
          <Text style={s.stepLabel}>Water</Text>
          <Text style={s.waterMeta}>
            {waterGlasses}/{waterTotal} glasses
          </Text>
        </View>
        {dayKind === "today" && onWaterAdjust ? (
          <View style={s.waterControls}>
            <Pressable
              onPress={() => onWaterAdjust(-1)}
              disabled={waterGlasses <= 0}
              hitSlop={6}
              style={[s.waterBtn, waterGlasses <= 0 && s.waterBtnDisabled]}
              accessibilityLabel="Remove a glass"
            >
              <Minus size={14} color={T.white} strokeWidth={2.4} />
            </Pressable>
            <Pressable
              onPress={() => onWaterAdjust(1)}
              hitSlop={6}
              style={s.waterBtn}
              accessibilityLabel="Add a glass"
            >
              <Plus size={14} color={T.white} strokeWidth={2.4} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.lg,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 12,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    headline: {
      fontFamily: T.bodySemi,
      fontSize: 13.5,
      color: T.white,
    },
    steps: { gap: 6 },
    stepPress: { borderRadius: 12 },
    stepRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 6,
      paddingHorizontal: 4,
      borderRadius: 12,
    },
    stepRowDone: { opacity: 0.92 },
    stepWell: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: "center",
      justifyContent: "center",
    },
    stepWellPending: {
      backgroundColor: "transparent",
      borderColor: T.border,
    },
    stepLabel: {
      flex: 1,
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.white,
    },
    stepLabelDone: {
      color: T.faint,
      textDecorationLine: "line-through",
    },
    openDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
    },
    waterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingTop: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: T.border,
    },
    waterCopy: { flex: 1, gap: 1 },
    waterMeta: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.faint,
      fontVariant: ["tabular-nums"],
    },
    waterControls: { flexDirection: "row", gap: 6 },
    waterBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: T.accentTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.accentLine,
    },
    waterBtnDisabled: { opacity: 0.35 },
  });
}
