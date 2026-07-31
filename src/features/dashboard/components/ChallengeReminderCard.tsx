import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import {
  Dumbbell,
  Coffee,
  UtensilsCrossed,
  Moon,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

export type ChallengeDayKind = "today" | "past" | "future";
type StepKey = "workout" | "breakfast" | "lunch" | "dinner";

type Props = {
  dayKind: ChallengeDayKind;
  workoutDone: boolean;
  breakfastDone: boolean;
  lunchDone: boolean;
  dinnerDone: boolean;
  onPress?: () => void;
};

const STEP_ORDER: { key: StepKey; Icon: any }[] = [
  { key: "workout", Icon: Dumbbell },
  { key: "breakfast", Icon: Coffee },
  { key: "lunch", Icon: UtensilsCrossed },
  { key: "dinner", Icon: Moon },
];

const STEP_COPY: Record<StepKey, string> = {
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
  onPress,
}: Props) {
  const doneMap: Record<StepKey, boolean> = {
    workout: workoutDone,
    breakfast: breakfastDone,
    lunch: lunchDone,
    dinner: dinnerDone,
  };
  const complete = workoutDone && breakfastDone && lunchDone && dinnerDone;
  const currentStep: StepKey | null =
    STEP_ORDER.find((s) => !doneMap[s.key])?.key ?? null;

  const isActionable = dayKind === "today" && !complete;

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isActionable) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
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

  if (complete) {
    message = "Challenge completed!";
    subLabel = dayKind === "today" ? "Nice work today" : undefined;
  } else if (dayKind === "future") {
    message = "Challenge not started yet";
    subLabel = "Come back on this day";
  } else if (dayKind === "past") {
    message = "Challenge not completed";
    subLabel = "New day, new start";
  } else {
    message = STEP_COPY[currentStep as StepKey];
  }

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      scaleTo={0.98}
      style={s.pressableReset}
    >
      <View
        style={[
          s.card,
          complete && s.cardComplete,
          dayKind === "future" && s.cardFuture,
        ]}
      >
        {complete && (
          <LinearGradient
            colors={[T.accentSoft, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <View style={s.progressRow}>
          {STEP_ORDER.map(({ key, Icon }, i) => {
            const done = doneMap[key];
            const isCurrent =
              dayKind === "today" && !complete && key === currentStep;
            return (
              <React.Fragment key={key}>
                <Animated.View
                  style={[
                    s.stepDot,
                    done && s.stepDotDone,
                    isCurrent && s.stepDotCurrent,
                    isCurrent && { transform: [{ scale: pulse }] },
                  ]}
                >
                  <Icon
                    size={13}
                    color={done ? T.onImage : isCurrent ? T.accent : T.faint}
                    strokeWidth={2}
                  />
                </Animated.View>
                {i < STEP_ORDER.length - 1 && (
                  <View style={[s.stepLine, done && s.stepLineDone]} />
                )}
              </React.Fragment>
            );
          })}
        </View>

        <View style={s.mainRow}>
          <View style={s.iconBadge}>
            {complete ? (
              <CheckCircle2 size={18} color={T.accent} strokeWidth={2} />
            ) : dayKind === "future" ? (
              <Lock size={16} color={T.faint} strokeWidth={2} />
            ) : (
              <Sparkles size={16} color={T.accent} strokeWidth={2} />
            )}
          </View>

          <View style={s.textBlock}>
            <Text style={[s.message, complete && s.messageComplete]}>
              {message}
            </Text>
            {subLabel ? (
              <Text style={s.deadline}>{subLabel.toUpperCase()}</Text>
            ) : null}
          </View>

          {onPress && (
            <View style={s.cta}>
              <ChevronRight size={16} color={T.faint} strokeWidth={2} />
            </View>
          )}
        </View>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  pressableReset: { borderRadius: 16 },
  card: {
    borderRadius: 16,
    backgroundColor: T.bgElevated,
    borderWidth: 0.5,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    overflow: "hidden",
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  cardComplete: { borderColor: T.accent },
  cardFuture: { opacity: 0.6 },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.bg,
  },
  stepDotDone: { backgroundColor: T.accent, borderColor: T.accent },
  stepDotCurrent: { borderColor: T.accent },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: T.border,
    marginHorizontal: 4,
  },
  stepLineDone: { backgroundColor: T.accent },

  mainRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { flex: 1 },
  message: {
    fontFamily: T.bodySemi,
    fontSize: 13.5,
    color: T.white,
    marginBottom: 2,
  },
  messageComplete: { color: T.accent },
  deadline: { fontFamily: T.bodyMed, fontSize: 11, color: T.faint },
  cta: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
