import React, { useEffect, useRef, useState, useCallback, memo } from "react";
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
import { Dumbbell } from "lucide-react-native";

// Font family strings only — same convention as ActiveWorkoutScreen.tsx.
// Worth pulling this + the colors into a shared theme.ts at some point so
// it isn't redeclared in every file.
const T = {
  bg: "#111318",
  glass: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.14)",
  ringGlass: "rgba(10,11,14,0.42)",
  ringBorder: "rgba(255,199,0,0.65)",
  accent: "#FFC700",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.7)",

  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};

type Props = {
  title: string;
  tag: string;
  minutes: number;
  exerciseCount: number;
  muscles: string;
  imageUrl: string;
  onPress?: () => void;
  /** Optional delay (ms) before the entrance animation starts — handy for staggering list items */
  entranceDelay?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** 96 -> "1h36m", 45 -> "45" */
function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  if (minutes < 60) return `${Math.round(minutes)}`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

function WorkoutPlanCardBase({
  title,
  tag,
  minutes,
  exerciseCount,
  muscles,
  imageUrl,
  onPress,
  entranceDelay = 0,
  style,
  testID,
}: Props) {
  // --- press feedback -------------------------------------------------
  const scale = useRef(new Animated.Value(1)).current;
  const pressOpacity = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
        friction: 7,
        tension: 140,
      }),
      Animated.timing(pressOpacity, {
        toValue: 0.85,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, pressOpacity]);

  const onPressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 140,
      }),
      Animated.timing(pressOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, pressOpacity]);

  // --- entrance animation ---------------------------------------------
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(entrance, {
      toValue: 1,
      duration: 420,
      delay: entranceDelay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- image load state (fixes broken-image / flash-of-empty bugs) ----
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const shimmer = useRef(new Animated.Value(0.3)).current;
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

  const durationValue = formatDuration(minutes);
  const durationUnit = minutes >= 60 ? "" : "min";

  // muscle groups get their own chip row instead of being crammed into one
  // truncated text line — capped at 3 visible + a "+N" overflow chip so a
  // long list can't push the row wider than the card.
  const muscleList = (muscles || "Full body")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const visibleMuscles = muscleList.slice(0, 3);
  const extraMuscles = muscleList.length - visibleMuscles.length;

  return (
    <Animated.View
      style={[
        {
          opacity: entrance,
          transform: [
            { scale },
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={!onPress}
        testID={testID}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={`${title}, ${tag}, ${exerciseCount} exercises, ${durationValue} ${
          durationUnit || "minutes"
        }, targets ${muscles}`}
        android_ripple={{ color: "rgba(255,255,255,0.12)", borderless: false }}
        hitSlop={4}
        style={s.pressableReset}
      >
        <Animated.View style={[s.card, { opacity: pressOpacity }]}>
          {imgStatus !== "error" ? (
            <>
              <Image
                source={{ uri: imageUrl }}
                style={s.image}
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
              <Dumbbell size={30} color={T.muted} strokeWidth={1.6} />
            </View>
          )}

          <LinearGradient
            colors={[
              "rgba(9,9,12,0.00)",
              "rgba(9,9,12,0.12)",
              "rgba(9,9,12,0.90)",
            ]}
            locations={[0, 0.38, 1]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          <View style={s.tagPill}>
            <Text style={s.tagText} numberOfLines={1}>
              {tag}
            </Text>
          </View>

          {/* translucent ring, not a filled disc — the photo shows through
              it instead of getting punched out by a solid sticker */}
          <View style={s.durationRing}>
            <Text style={s.durationValue}>{durationValue}</Text>
            {!!durationUnit && (
              <Text style={s.durationUnit}>{durationUnit}</Text>
            )}
          </View>

          <View style={s.bottomContent} pointerEvents="none">
            <Text style={s.title} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            <Text style={s.subtitle} numberOfLines={1}>
              {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
            </Text>
            <View style={s.muscleRow}>
              {visibleMuscles.map((m) => (
                <View key={m} style={s.muscleChip}>
                  <Text style={s.muscleChipText} numberOfLines={1}>
                    {m}
                  </Text>
                </View>
              ))}
              {extraMuscles > 0 && (
                <View style={s.muscleChip}>
                  <Text style={s.muscleChipText}>+{extraMuscles}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export const WorkoutPlanCard = memo(WorkoutPlanCardBase);

const s = StyleSheet.create({
  pressableReset: { borderRadius: 26 },
  card: {
    height: 188,
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: T.bg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },

  image: { ...StyleSheet.absoluteFillObject },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.bg,
  },

  tagPill: {
    position: "absolute",
    top: 12,
    left: 14,
    maxWidth: 130,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontFamily: T.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: T.white,
  },

  durationRing: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: T.ringBorder,
    backgroundColor: T.ringGlass,
    alignItems: "center",
    justifyContent: "center",
  },
  durationValue: {
    fontFamily: T.display,
    fontSize: 13,
    lineHeight: 15,
    color: T.accent,
    fontVariant: ["tabular-nums"],
  },
  durationUnit: {
    fontFamily: T.bodySemi,
    fontSize: 8,
    color: T.muted,
    marginTop: -1,
  },

  bottomContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    gap: 6,
  },
  title: {
    fontFamily: T.display,
    fontSize: 19,
    letterSpacing: -0.4,
    color: T.white,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: T.bodyMed,
    fontSize: 12,
    color: T.muted,
  },
  muscleRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  muscleChip: {
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  muscleChipText: {
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 0.2,
    color: T.white,
  },
});
