import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import {
  CheckCircle2,
  MinusCircle,
  ChevronRight,
  Dumbbell,
  Coffee,
  UtensilsCrossed,
  Moon,
  type LucideProps,
} from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import { useTheme } from "@/src/context/ThemeContext";
import type { AppTheme } from "@/src/theme";
import { PressableScale } from "./PressableScale";
import { GlassSurface } from "./GlassSurface";

export type ChallengeDayKind = "today" | "past" | "future";
type StepKey = "workout" | "breakfast" | "lunch" | "dinner";

type Props = {
  dayKind: ChallengeDayKind;
  workoutDone: boolean;
  breakfastDone: boolean;
  lunchDone: boolean;
  dinnerDone: boolean;
  isLoading?: boolean;
  onPress?: () => void;
};

const STEPS: StepKey[] = ["workout", "breakfast", "lunch", "dinner"];

const STEP_MESSAGE: Record<StepKey, string> = {
  workout: "Time for today's workout",
  breakfast: "Log your breakfast",
  lunch: "Log your lunch next",
  dinner: "Finish strong — log dinner",
};

const STEP_ICON: Record<StepKey, React.ComponentType<LucideProps>> = {
  workout: Dumbbell,
  breakfast: Coffee,
  lunch: UtensilsCrossed,
  dinner: Moon,
};

/**
 * Per-step signature colors (light / dark). Workout uses theme accent at
 * call sites; these are the fixed semantic accents for meals.
 */
const STEP_SEMANTIC = {
  breakfast: {
    light: {
      bg: "rgba(232,140,60,0.16)",
      border: "rgba(232,140,60,0.32)",
      icon: "#D4842A",
    },
    dark: {
      bg: "rgba(255,170,80,0.20)",
      border: "rgba(255,170,80,0.36)",
      icon: "#FFB35C",
    },
  },
  lunch: {
    light: {
      bg: "rgba(46,150,90,0.14)",
      border: "rgba(46,150,90,0.30)",
      icon: "#2A8F52",
    },
    dark: {
      bg: "rgba(80,220,140,0.18)",
      border: "rgba(80,220,140,0.34)",
      icon: "#5EE09A",
    },
  },
  dinner: {
    light: {
      bg: "rgba(80,90,190,0.14)",
      border: "rgba(80,90,190,0.30)",
      icon: "#4A55B0",
    },
    dark: {
      bg: "rgba(130,145,255,0.18)",
      border: "rgba(130,145,255,0.34)",
      icon: "#9AA6FF",
    },
  },
} as const;

type WellColors = { bg: string; border: string; icon: string };

function stepWellColors(
  key: StepKey,
  resolved: "light" | "dark",
  T: AppTheme,
): WellColors {
  if (key === "workout") {
    return {
      bg: T.accentTint,
      border: T.accentLine,
      icon: T.accent,
    };
  }
  return STEP_SEMANTIC[key][resolved];
}

export function ChallengeReminderCard({
  dayKind,
  workoutDone,
  breakfastDone,
  lunchDone,
  dinnerDone,
  isLoading,
  onPress,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const { resolved } = useTheme();

  const doneMap: Record<StepKey, boolean> = {
    workout: workoutDone,
    breakfast: breakfastDone,
    lunch: lunchDone,
    dinner: dinnerDone,
  };
  const complete = workoutDone && breakfastDone && lunchDone && dinnerDone;
  const currentStep: StepKey | null =
    STEPS.find((key) => !doneMap[key]) ?? null;

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
          toValue: 1.08,
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

  let message: string;
  let subLabel: string | undefined;

  if (isLoading) {
    message = "Checking today's progress…";
  } else if (complete) {
    message = "Challenge completed!";
    subLabel = dayKind === "today" ? "Nice work today" : undefined;
  } else if (dayKind === "future") {
    message = "Challenge not started yet";
    subLabel = "Come back on this day";
  } else if (dayKind === "past") {
    message = "Challenge not completed";
    subLabel = "New day, new start";
  } else {
    message = STEP_MESSAGE[currentStep as StepKey];
  }

  const focusStep: StepKey = currentStep ?? "workout";
  const focusColors = stepWellColors(focusStep, resolved, T);

  let iconBadgeStyle: object[];
  let icon: React.ReactNode;

  if (isLoading) {
    iconBadgeStyle = [s.iconBadge, s.iconBadgeQuiet];
    icon = <Dumbbell size={16} color={T.faint} strokeWidth={2} />;
  } else if (complete) {
    iconBadgeStyle = [
      s.iconBadge,
      {
        backgroundColor: T.accentTint,
        borderColor: T.accentLine,
      },
    ];
    icon = <CheckCircle2 size={16} color={T.accent} strokeWidth={2} />;
  } else if (dayKind === "past") {
    iconBadgeStyle = [s.iconBadge, s.iconBadgeMissed];
    icon = <MinusCircle size={16} color={T.faint} strokeWidth={2} />;
  } else {
    iconBadgeStyle = [
      s.iconBadge,
      {
        backgroundColor: focusColors.bg,
        borderColor: focusColors.border,
      },
    ];
    const StepIcon = STEP_ICON[focusStep];
    icon = <StepIcon size={16} color={focusColors.icon} strokeWidth={2} />;
  }

  const showProgress = !isLoading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress || isLoading}
      scaleTo={0.98}
      style={s.pressableReset}
    >
      <GlassSurface style={s.card}>
        <Animated.View
          style={[...iconBadgeStyle, { transform: [{ scale: pulse }] }]}
        >
          {icon}
        </Animated.View>

        <View style={s.textBlock}>
          <Text style={s.message}>{message}</Text>
          {showProgress && (
            <View
              style={s.progressRow}
              accessibilityRole="summary"
              accessibilityLabel={`${STEPS.filter((k) => doneMap[k]).length} of 4 steps done`}
            >
              {STEPS.map((key) => {
                const colors = stepWellColors(key, resolved, T);
                const done = doneMap[key];
                const StepIcon = STEP_ICON[key];
                return (
                  <View
                    key={key}
                    style={[
                      s.miniWell,
                      done
                        ? {
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                          }
                        : s.miniWellPending,
                    ]}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  >
                    <StepIcon
                      size={10}
                      color={done ? colors.icon : T.faint}
                      strokeWidth={2.2}
                    />
                  </View>
                );
              })}
            </View>
          )}
          {subLabel ? (
            <Text style={s.deadline}>{subLabel.toUpperCase()}</Text>
          ) : null}
        </View>

        {onPress && !isLoading && (
          <View style={s.cta}>
            <ChevronRight size={16} color={T.faint} strokeWidth={2} />
          </View>
        )}
      </GlassSurface>
    </PressableScale>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    pressableReset: { borderRadius: 16 },
    card: {
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    iconBadgeQuiet: {
      backgroundColor: T.accentTint,
      borderColor: T.border,
    },
    iconBadgeMissed: {
      backgroundColor: T.border,
      borderColor: T.border,
    },
    textBlock: { flex: 1, gap: 5, zIndex: 1 },
    message: {
      fontFamily: T.bodySemi,
      fontSize: 13.5,
      color: T.white,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    miniWell: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: "center",
      justifyContent: "center",
    },
    miniWellPending: {
      backgroundColor: "transparent",
      borderColor: T.border,
    },
    deadline: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.faint,
    },
    cta: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
  });
}
