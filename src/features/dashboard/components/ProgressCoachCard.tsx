import { useEffect, useMemo, useRef } from "react";
import { Scale, Sparkles, Trophy } from "lucide-react-native";
import {
  Animated as RNAnimated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Polyline,
  Polygon,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "./GlassSurface";

const AnimatedPolyline = RNAnimated.createAnimatedComponent(Polyline);
const AnimatedCircle = RNAnimated.createAnimatedComponent(Circle);

type Props = {
  progressLabel: string;
  progressValue: string;
  sparklinePoints: number[];
  coachHeadline: string;
  coachBody: string;
  goalHit?: boolean;
};

function polylineLength(points: { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

export function ProgressCoachCard({
  progressLabel,
  progressValue,
  sparklinePoints,
  coachHeadline,
  coachBody,
  goalHit = false,
}: Props) {
  const { T, styles } = useThemedStyles(makeStyles);

  const width = 220;
  const height = 26;
  const hasSpark = sparklinePoints.length >= 2;
  const step = hasSpark ? width / (sparklinePoints.length - 1) : 0;

  const coords = useMemo(
    () =>
      hasSpark
        ? sparklinePoints.map((y, i) => ({ x: i * step, y }))
        : [],
    [sparklinePoints, step, hasSpark],
  );
  const points = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const lineLength = useMemo(() => polylineLength(coords), [coords]);

  const lastX = hasSpark ? (sparklinePoints.length - 1) * step : 0;
  const lastY = hasSpark ? sparklinePoints[sparklinePoints.length - 1] : 0;
  const areaPoints = hasSpark
    ? `0,${height} ${points} ${lastX},${height}`
    : "";

  const entrance = useRef(new RNAnimated.Value(0)).current;
  const draw = useRef(new RNAnimated.Value(0)).current;
  const pulse = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(entrance, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (!hasSpark) return;

    RNAnimated.timing(draw, {
      toValue: 1,
      duration: 900,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        RNAnimated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
        RNAnimated.delay(500),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lineLength, hasSpark]);

  const dashOffset = draw.interpolate({
    inputRange: [0, 1],
    outputRange: [lineLength, 0],
  });
  const haloRadius = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 10],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  return (
    <RNAnimated.View
      style={{
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
      }}
    >
      <GlassSurface style={styles.card}>
        <View style={styles.top}>
          <View style={styles.icon}>
            <Scale size={16} color={T.accent} strokeWidth={2} />
          </View>
          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={styles.label}>{progressLabel}</Text>
              <Text style={styles.value}>{progressValue}</Text>
            </View>
            {hasSpark ? (
              <Svg
                width="100%"
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={styles.spark}
              >
                <Defs>
                  <SvgLinearGradient id="sparkFade" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={T.accent} stopOpacity={0.28} />
                    <Stop offset="1" stopColor={T.accent} stopOpacity={0} />
                  </SvgLinearGradient>
                </Defs>
                <Polygon points={areaPoints} fill="url(#sparkFade)" />
                <AnimatedPolyline
                  points={points}
                  fill="none"
                  stroke={T.accent}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={lineLength}
                  strokeDashoffset={dashOffset}
                />
                <AnimatedCircle
                  cx={lastX}
                  cy={lastY}
                  r={haloRadius}
                  fill="none"
                  stroke={T.accent}
                  strokeWidth={1}
                  strokeOpacity={haloOpacity}
                />
                <Circle cx={lastX} cy={lastY} r={3} fill={T.accent} />
              </Svg>
            ) : (
              <Text style={styles.sparkEmpty}>
                Log weight a couple times to unlock your trend.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottom}>
          <View style={styles.eyebrowRow}>
            {goalHit ? (
              <Trophy size={11} color={T.accent} strokeWidth={2.2} />
            ) : (
              <Sparkles size={11} color={T.accent} strokeWidth={2.2} />
            )}
            <Text style={styles.eyebrow}>COACH'S NOTE</Text>
          </View>

          <View style={styles.noteRow}>
            <View style={styles.quoteBar} />
            <View style={styles.noteText}>
              <Text style={styles.headline}>{coachHeadline}</Text>
              <Text style={styles.coachBody}>{coachBody}</Text>
            </View>
          </View>
        </View>
      </GlassSurface>
    </RNAnimated.View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.md,
    },
    top: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 16,
      zIndex: 1,
    },
    icon: {
      width: 38,
      height: 38,
      borderRadius: T.radius.sm,
      backgroundColor: T.ringGlass,
      borderWidth: 0.5,
      borderColor: T.ringBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    body: { flex: 1 },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    label: { fontFamily: T.bodySemi, fontSize: 11, color: T.muted },
    value: {
      fontFamily: T.displaySemi,
      fontSize: 14.5,
      color: T.accent,
      letterSpacing: -0.1,
    },
    spark: { marginTop: 8 },
    sparkEmpty: {
      marginTop: 8,
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      color: T.faint,
      lineHeight: 16,
    },
    divider: {
      height: 1,
      backgroundColor: T.glassBorder,
      marginHorizontal: 18,
      zIndex: 1,
    },
    bottom: { padding: 16, paddingTop: 14, zIndex: 1 },
    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
    },
    eyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 0.6,
      color: T.accent,
    },
    noteRow: { flexDirection: "row", gap: 10 },
    quoteBar: {
      width: 2.5,
      borderRadius: 2,
      backgroundColor: T.accentLine,
    },
    noteText: { flex: 1 },
    headline: {
      fontFamily: T.displaySemi,
      fontSize: 14,
      color: T.white,
      letterSpacing: -0.2,
      marginBottom: 4,
    },
    coachBody: {
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      color: T.muted,
      lineHeight: 17,
    },
  });
}
