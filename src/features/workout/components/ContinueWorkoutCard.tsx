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
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import { Play } from "lucide-react-native";

// Font family strings + palette — same convention as the other components.
// Worth pulling into a shared theme.ts alongside them at some point.
const T = {
  panel: "#15161C",
  panelBorder: "rgba(255,255,255,0.08)",
  glow: "rgba(255,199,0,0.10)",
  glass: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.10)",
  hairline: "rgba(255,255,255,0.10)",

  accent: "#FFC700",
  accentSoft: "#FFE066",
  accentText: "#1A1300",

  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",

  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};

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
      useNativeDriver: false, // strokeDashoffset isn't native-animatable
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
        <Defs>
          <SvgGradient
            id="continueRingGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={T.accent} />
            <Stop offset="100%" stopColor={T.accentSoft} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={sw}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#continueRingGrad)"
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
        android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
        hitSlop={4}
        style={s.pressableReset}
      >
        <View style={s.card}>
          {/* the one bit of color on the card, kept deliberately faint */}
          <View style={s.glow} pointerEvents="none" />

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
                color={T.accentText}
                strokeWidth={2.5}
                fill={T.accentText}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  pressableReset: { borderRadius: 28 },
  card: {
    borderRadius: 28,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  glow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: T.glow,
    top: -60,
    right: -50,
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
    fontFamily: T.display,
    fontSize: 21,
    letterSpacing: -0.4,
    color: T.white,
  },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
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
    color: T.white,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  statItem: { gap: 1 },
  statValue: {
    fontFamily: T.display,
    fontSize: 15,
    color: T.white,
    fontVariant: ["tabular-nums"],
  },
  statLabel: { fontFamily: T.bodyMed, fontSize: 10, color: T.muted },
  hairline: { width: 1, height: 24, backgroundColor: T.hairline },

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
    borderColor: T.panel,
  },
  ringPercent: {
    fontFamily: T.display,
    fontSize: 18,
    color: T.white,
    fontVariant: ["tabular-nums"],
  },
  ringPercentSign: { fontFamily: T.bodySemi, fontSize: 11, color: T.muted },
});
