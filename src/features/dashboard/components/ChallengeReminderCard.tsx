import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { AlarmClock, ArrowUpRight } from "lucide-react-native";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

// This card's background IS the accent, same relationship as the old
// TodaysChallengeCard — needs a deeper gold for the blob and the raw RGB of
// T.bg for translucent overlays, since the shared token set only has the
// solid values.
const accentDeep = "#E8AE00";
const darkRgb = "17,19,24"; // matches T.bg

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
  // pulsing icon badge — draws the eye without being obnoxious
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
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
  }, [pulse]);

  // diagonal light sweep across the gold surface, looping every few seconds
  const sweep = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1800),
        Animated.timing(sweep, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      scaleTo={0.98}
      style={s.pressableReset}
    >
      <View style={s.card}>
        <View style={s.blob} />
        <DotGrid />

        {/* light sweep */}
        <Animated.View
          pointerEvents="none"
          style={[
            s.sweepWrap,
            {
              transform: [
                {
                  translateX: sweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-220, 340],
                  }),
                },
                { rotate: "20deg" },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.35)",
              "rgba(255,255,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.sweepBar}
          />
        </Animated.View>

        <View style={s.content}>
          <Animated.View
            style={[s.iconBadge, { transform: [{ scale: pulse }] }]}
          >
            <AlarmClock size={17} color={T.accent} strokeWidth={2.2} />
          </Animated.View>

          <View style={s.textBlock}>
            <Text style={s.message}>{message}</Text>
            <Text style={s.deadline}>{deadlineLabel}</Text>
          </View>
        </View>

        <View style={s.cta}>
          <ArrowUpRight size={18} color={T.accent} strokeWidth={2.4} />
        </View>
      </View>
    </PressableScale>
  );
}

function DotGrid() {
  const rows = 3;
  const cols = 5;
  const spacing = 8;
  return (
    <Svg width={cols * spacing} height={rows * spacing} style={s.dotGrid}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <Circle
            key={`${r}-${c}`}
            cx={c * spacing + spacing / 2}
            cy={r * spacing + spacing / 2}
            r={1.3}
            fill={`rgba(${darkRgb},0.3)`}
          />
        )),
      )}
    </Svg>
  );
}

const s = StyleSheet.create({
  pressableReset: { borderRadius: 24 },
  card: {
    height: 96,
    borderRadius: 24,
    backgroundColor: T.accent,
    overflow: "hidden",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  blob: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: accentDeep,
    top: -60,
    right: -30,
    opacity: 0.55,
  },
  dotGrid: { position: "absolute", left: 18, bottom: 12 },
  sweepWrap: { position: "absolute", top: -20, bottom: -20, width: 80 },
  sweepBar: { flex: 1, width: 80 },

  content: { flexDirection: "row", alignItems: "center", gap: 13, flex: 1 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: `rgba(${darkRgb},0.14)`,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { flex: 1 },
  message: {
    fontFamily: T.display,
    fontSize: 14.5,
    color: T.bg,
    marginBottom: 2,
  },
  deadline: {
    fontFamily: T.bodySemi,
    fontSize: 11.5,
    color: `rgba(${darkRgb},0.65)`,
  },

  cta: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.bg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
