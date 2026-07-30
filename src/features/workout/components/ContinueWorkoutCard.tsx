import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Play } from "lucide-react-native";
import { T } from "@/src/theme";

type Props = {
  title: string;
  tag: string;
  minutes: number;
  calories: number;
  percent: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ProgressRing({
  percent,
  size = 84,
}: {
  percent: number;
  size?: number;
}) {
  const sw = 7;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const prog = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(prog, {
      toValue: clamped / 100,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, prog]);

  const offset = prog.interpolate({
    inputRange: [0, 1],
    outputRange: [circ, 0],
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={T.border}
          strokeWidth={sw}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={T.accent}
          strokeWidth={sw}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={s.ringPercent}>
        {Math.round(clamped)}
        <Text style={s.ringPercentSign}>%</Text>
      </Text>
    </View>
  );
}

export function ContinueWorkoutCard({
  title,
  tag,
  minutes,
  calories,
  percent,
  onPress,
  style,
  testID,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 7,
      tension: 140,
    }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 140,
    }).start();
  }, [scale]);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={!onPress}
        testID={testID}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={`Continue ${title}, ${tag}, ${Math.round(percent)} percent complete, ${minutes} minutes left, ${calories} calories`}
        android_ripple={{ color: "rgba(10,10,10,0.06)", borderless: false }}
        hitSlop={4}
        style={s.pressableReset}
      >
        <View style={s.card}>
          <View style={s.left}>
            <Text style={s.eyebrow}>Continue workout</Text>
            <Text style={s.title} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>

            <View style={s.tagPill}>
              <Text style={s.tagText}>{tag}</Text>
            </View>

            <View style={s.statRow}>
              <View style={s.statItem}>
                <Text style={s.statValue}>{minutes}</Text>
                <Text style={s.statLabel}>min left</Text>
              </View>
              <View style={s.hairline} />
              <View style={s.statItem}>
                <Text style={s.statValue}>{calories}</Text>
                <Text style={s.statLabel}>cal</Text>
              </View>
            </View>
          </View>

          <View style={s.right}>
            <ProgressRing percent={percent} />
            <View style={s.playBadge}>
              <Play
                size={14}
                color={T.onImage}
                strokeWidth={2.5}
                fill={T.onImage}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  pressableReset: { borderRadius: 24 },
  card: {
    borderRadius: 24,
    backgroundColor: T.glass,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },

  left: { flex: 1, gap: 6, paddingRight: 14 },
  eyebrow: {
    fontFamily: T.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: T.accent,
  },
  title: {
    fontFamily: T.displayBold,
    fontSize: 21,
    letterSpacing: -0.4,
    color: T.white,
  },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: T.accentTint,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 2,
  },
  tagText: {
    fontFamily: T.bodyBold,
    fontSize: 9.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: T.accent,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  statItem: { gap: 1 },
  statValue: {
    fontFamily: T.displaySemi,
    fontSize: 15,
    color: T.white,
    fontVariant: ["tabular-nums"],
  },
  statLabel: { fontFamily: T.bodyMed, fontSize: 10, color: T.muted },
  hairline: { width: 1, height: 24, backgroundColor: T.border },

  right: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  playBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: T.glass,
  },
  ringPercent: {
    fontFamily: T.displaySemi,
    fontSize: 18,
    color: T.white,
    fontVariant: ["tabular-nums"],
  },
  ringPercentSign: { fontFamily: T.bodySemi, fontSize: 11, color: T.muted },
});
