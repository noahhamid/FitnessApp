import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { AlarmClock, ChevronRight } from "lucide-react-native";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

type Props = {
  message: string; // "Don't miss today's challenge"
  deadlineLabel: string; // "Before 6:00 PM"
  onPress?: () => void;
};

export function ChallengeReminderCard({
  message,
  deadlineLabel,
  onPress,
}: Props) {
  // slow icon pulse — the one bit of motion worth keeping, easy to miss if you blink
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
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
  }, [pulse]);

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      scaleTo={0.98}
      style={s.pressableReset}
    >
      <View style={s.card}>
        <Animated.View style={[s.iconBadge, { transform: [{ scale: pulse }] }]}>
          <AlarmClock size={16} color={T.accent} strokeWidth={2} />
        </Animated.View>

        <View style={s.textBlock}>
          <Text style={s.message}>{message}</Text>
          <Text style={s.deadline}>{deadlineLabel.toUpperCase()}</Text>
        </View>

        <View style={s.cta}>
          <ChevronRight size={16} color={T.faint} strokeWidth={2} />
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
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
