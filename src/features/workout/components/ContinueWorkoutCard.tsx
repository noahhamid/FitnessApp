import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { Play, Dumbbell, Trophy } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import type { PersonalRecord } from "@/src/features/progress/hooks/useProgress";
import {
  MUSCLE_ICON,
  formatMuscleGroup,
} from "../lib/muscle-icons";

type ExerciseItem = {
  id: string;
  name: string;
  type: "reps" | "duration";
  sets: number;
  reps?: number;
  durationSec?: number;
  muscleGroup?: string;
};

type Props = {
  title: string;
  tag: string;
  minutes: number;
  calories: number;
  percent: number;
  /** Cover photo for the hero — same source as WorkoutPlanCard. */
  imageUrl?: string;
  /** Used for muscle chips + PR highlight; list is not rendered. */
  exercises?: ExerciseItem[];
  /** From usePersonalRecords — used to highlight a PR for this workout. */
  personalRecords?: PersonalRecord[];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Same dedup idea as WorkoutScreen.muscleSummary — unique groups, order preserved. */
function uniqueMuscleGroups(exercises: ExerciseItem[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ex of exercises) {
    const g = ex.muscleGroup?.toLowerCase();
    if (!g || seen.has(g)) continue;
    seen.add(g);
    out.push(g);
  }
  return out;
}

/**
 * Prefer a PR for an exercise in this workout; else most recent overall
 * (API already sorts by achievedAt desc). Null if none.
 */
function pickHighlightedPr(
  exercises: ExerciseItem[] | undefined,
  records: PersonalRecord[] | undefined,
): PersonalRecord | null {
  if (!records || records.length === 0) return null;
  const names = new Set((exercises ?? []).map((e) => e.name));
  const inWorkout = records.find((r) => names.has(r.exerciseName));
  return inWorkout ?? records[0] ?? null;
}

function ProgressRing({
  percent,
  size = 84,
}: {
  percent: number;
  size?: number;
}) {
  const { T, styles: s } = useThemedStyles(makeStyles);
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
  imageUrl,
  exercises,
  personalRecords,
  onPress,
  style,
  testID,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const scale = useRef(new Animated.Value(1)).current;
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">(
    imageUrl ? "loading" : "error",
  );
  const shimmer = useRef(new Animated.Value(0.3)).current;

  const muscleGroups = useMemo(
    () => uniqueMuscleGroups(exercises ?? []),
    [exercises],
  );

  const highlightedPr = useMemo(
    () => pickHighlightedPr(exercises, personalRecords),
    [exercises, personalRecords],
  );

  useEffect(() => {
    if (imgStatus !== "loading") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.55,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.3,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [imgStatus, shimmer]);

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.98, ...T.motion.settle }).start();
  }, [scale, T]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, ...T.motion.settle }).start();
  }, [scale, T]);

  const meta = `${minutes} min left · ${calories} cal · ${Math.round(percent)}% done`;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <View style={s.card} testID={testID}>
        {/* Photo hero — same treatment as WorkoutPlanCard */}
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={!onPress}
          accessibilityRole={onPress ? "button" : undefined}
          accessibilityLabel={`Continue ${title}, ${tag}, ${meta}`}
          style={s.heroPressable}
        >
          <View style={s.hero}>
            {imgStatus !== "error" && imageUrl ? (
              <>
                <Image
                  source={{ uri: imageUrl }}
                  style={s.heroImage}
                  resizeMode="cover"
                  onLoad={() => setImgStatus("loaded")}
                  onError={() => setImgStatus("error")}
                  accessible
                  accessibilityLabel={`${title} workout preview`}
                />
                {imgStatus === "loading" && (
                  <Animated.View
                    style={[s.shimmerOverlay, { opacity: shimmer }]}
                  />
                )}
              </>
            ) : (
              <View style={s.imageFallback}>
                <Dumbbell size={30} color={T.faint} strokeWidth={1.6} />
              </View>
            )}

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.45)"]}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />

            <View style={s.heroTagPill}>
              <Text style={s.heroTagText} numberOfLines={1}>
                In progress
              </Text>
            </View>

            <View style={s.playBtn} pointerEvents="none">
              <Play
                size={22}
                color={T.onImage}
                strokeWidth={2.4}
                fill={T.onImage}
              />
            </View>
          </View>
        </Pressable>

        <View style={s.bodyPad}>
          <View style={s.headerRow}>
            <View style={s.left}>
              <Text style={s.eyebrow}>Continue workout</Text>
              <Text style={s.title} numberOfLines={1} ellipsizeMode="tail">
                {title}
              </Text>

              <View style={s.tagPill}>
                <Text style={s.tagText}>{tag}</Text>
              </View>

              {muscleGroups.length > 0 && (
                <View style={s.chipRow}>
                  {muscleGroups.map((g, i) => {
                    const Icon = MUSCLE_ICON[g] ?? Dumbbell;
                    const primary = i === 0;
                    return (
                      <View
                        key={g}
                        style={[s.chip, primary && s.chipPrimary]}
                      >
                        <Icon
                          size={11}
                          color={primary ? T.accent : T.muted}
                          strokeWidth={2.2}
                        />
                        <Text
                          style={[s.chipText, primary && s.chipTextPrimary]}
                        >
                          {formatMuscleGroup(g)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

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
            </View>
          </View>

          {highlightedPr && (
            <>
              <View style={s.divider} />
              <View style={s.prRow}>
                <View style={s.prIconWrap}>
                  <Trophy size={13} color={T.accent} strokeWidth={2.2} />
                </View>
                <View style={s.prTextWrap}>
                  <Text style={s.prEyebrow}>Personal record</Text>
                  <Text style={s.prTitle} numberOfLines={1}>
                    {highlightedPr.exerciseName}
                  </Text>
                </View>
                <Text style={s.prValue}>
                  {highlightedPr.heaviestWeight} kg
                  <Text style={s.prValueMuted}>
                    {" "}
                    · {highlightedPr.repsAtHeaviest}
                  </Text>
                </Text>
              </View>
            </>
          )}

          <Pressable
            onPress={onPress}
            disabled={!onPress}
            accessibilityRole="button"
            accessibilityLabel={`Continue workout, ${title}`}
            style={({ pressed }) => [
              s.cta,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Play
              size={14}
              color={T.onAccent}
              strokeWidth={2.5}
              fill={T.onAccent}
            />
            <Text style={s.ctaText}>Continue workout</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.md,
      // Solid elevated surface — T.glass is translucent in darkTheme and
      // Android elevation paints a white plate under translucent fills.
      backgroundColor: T.bgElevated,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
      overflow: "hidden",
      ...T.shadow.card,
    },
    heroPressable: {},
    hero: {
      height: 156,
      width: "100%",
      backgroundColor: T.bgElevated,
      justifyContent: "center",
      alignItems: "center",
    },
    heroImage: { ...StyleSheet.absoluteFillObject },
    shimmerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: T.bgElevated,
    },
    imageFallback: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: T.accentTint,
    },
    heroTagPill: {
      position: "absolute",
      top: 12,
      left: 14,
      backgroundColor: T.onImageGlass,
      borderWidth: 1,
      borderColor: T.onImageBorder,
      borderRadius: T.radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    heroTagText: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: T.onImage,
    },
    playBtn: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: T.onImageGlass,
      borderWidth: 1,
      borderColor: T.onImageBorder,
      alignItems: "center",
      justifyContent: "center",
      paddingLeft: 2,
    },
    bodyPad: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
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

    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 4,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: T.accentTint,
      borderWidth: 0.5,
      borderColor: T.border,
    },
    chipPrimary: {
      backgroundColor: T.accentTint,
      borderColor: T.accentLine,
    },
    chipText: {
      fontFamily: T.bodySemi,
      fontSize: 10.5,
      color: T.muted,
    },
    chipTextPrimary: {
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
    ringPercent: {
      fontFamily: T.displaySemi,
      fontSize: 18,
      color: T.white,
      fontVariant: ["tabular-nums"],
    },
    ringPercentSign: { fontFamily: T.bodySemi, fontSize: 11, color: T.muted },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: T.border,
      marginTop: 18,
      marginBottom: 14,
    },

    prRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: T.accentTint,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: T.accentLine,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    prIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: T.bgElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    prTextWrap: { flex: 1, gap: 1 },
    prEyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 9,
      letterSpacing: 1.1,
      textTransform: "uppercase",
      color: T.accent,
    },
    prTitle: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.white,
    },
    prValue: {
      fontFamily: T.displaySemi,
      fontSize: 13,
      color: T.accent,
      fontVariant: ["tabular-nums"],
    },
    prValueMuted: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.muted,
    },

    cta: {
      marginTop: 14,
      height: 40,
      borderRadius: T.radius.sm,
      backgroundColor: T.accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    ctaText: {
      fontFamily: T.bodySemi,
      fontSize: 14,
      color: T.onAccent,
    },
  });
}
