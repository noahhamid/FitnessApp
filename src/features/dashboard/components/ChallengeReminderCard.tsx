import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import {
  AlarmClock,
  CheckCircle2,
  MinusCircle,
  ChevronRight,
} from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { PressableScale } from "./PressableScale";

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

const STEP_MESSAGE: Record<StepKey, string> = {
  workout: "Get today's workout in",
  breakfast: "Log your breakfast",
  lunch: "Log your lunch",
  dinner: "Log your dinner",
};

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

  const doneMap: Record<StepKey, boolean> = {
    workout: workoutDone,
    breakfast: breakfastDone,
    lunch: lunchDone,
    dinner: dinnerDone,
  };
  const complete = workoutDone && breakfastDone && lunchDone && dinnerDone;
  const currentStep: StepKey | null =
    (["workout", "breakfast", "lunch", "dinner"] as StepKey[]).find(
      (s) => !doneMap[s],
    ) ?? null;

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

  const iconBadgeStyle = isLoading
    ? [s.iconBadge]
    : complete
      ? [s.iconBadge, s.iconBadgeComplete]
      : dayKind === "past"
        ? [s.iconBadge, s.iconBadgeMissed]
        : [s.iconBadge];

  const icon = isLoading ? (
    <AlarmClock size={16} color={T.faint} strokeWidth={2} />
  ) : complete ? (
    <CheckCircle2 size={16} color={T.accent} strokeWidth={2} />
  ) : dayKind === "past" ? (
    <MinusCircle size={16} color={T.faint} strokeWidth={2} />
  ) : (
    <AlarmClock size={16} color={T.accent} strokeWidth={2} />
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress || isLoading}
      scaleTo={0.98}
      style={s.pressableReset}
    >
      <View style={s.card}>
        <Animated.View
          style={[...iconBadgeStyle, { transform: [{ scale: pulse }] }]}
        >
          {icon}
        </Animated.View>

        <View style={s.textBlock}>
          <Text style={s.message}>{message}</Text>
          {subLabel ? (
            <Text style={s.deadline}>{subLabel.toUpperCase()}</Text>
          ) : null}
        </View>

        {onPress && !isLoading && (
          <View style={s.cta}>
            <ChevronRight size={16} color={T.faint} strokeWidth={2} />
          </View>
        )}
      </View>
    </PressableScale>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    pressableReset: { borderRadius: 16 },
    card: {
      borderRadius: 16,
      backgroundColor: T.bgElevated,
      borderWidth: 0.5,
      borderColor: T.border,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 13,
      gap: 10,
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 1,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: T.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBadgeComplete: { backgroundColor: T.accentSoft },
    iconBadgeMissed: { backgroundColor: T.border },
    textBlock: { flex: 1 },
    message: {
      fontFamily: T.bodySemi,
      fontSize: 13.5,
      color: T.white,
      marginBottom: 2,
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
    },
  });
}
