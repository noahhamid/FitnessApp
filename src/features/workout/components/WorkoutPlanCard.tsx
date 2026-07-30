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
import { T } from "@/src/theme";

type Props = {
  title: string;
  tag: string;
  minutes: number;
  exerciseCount: number;
  muscles: string;
  imageUrl: string;
  onPress?: () => void;
  entranceDelay?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

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
        toValue: 0.9,
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
        android_ripple={{ color: "rgba(10,10,10,0.08)", borderless: false }}
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
              <Dumbbell size={30} color={T.faint} strokeWidth={1.6} />
            </View>
          )}

          <LinearGradient
            colors={[
              "rgba(9,9,12,0.00)",
              "rgba(9,9,12,0.12)",
              "rgba(9,9,12,0.88)",
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
  pressableReset: { borderRadius: 24 },
  card: {
    height: 188,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: T.glass,
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 4 }, // was height: 6
    shadowOpacity: 0.07, // was 0.08
    shadowRadius: 20, // was 14
    elevation: 4, // was 2
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
    backgroundColor: T.glass,
  },

  tagPill: {
    position: "absolute",
    top: 12,
    left: 14,
    maxWidth: 130,
    backgroundColor: T.onImageGlass,
    borderWidth: 1,
    borderColor: T.onImageBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontFamily: T.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: T.onImage,
  },

  durationRing: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: T.accent,
    backgroundColor: T.onImageGlass,
    alignItems: "center",
    justifyContent: "center",
  },
  durationValue: {
    fontFamily: T.displayBold,
    fontSize: 13,
    lineHeight: 15,
    color: T.onImage,
    fontVariant: ["tabular-nums"],
  },
  durationUnit: {
    fontFamily: T.bodySemi,
    fontSize: 8,
    color: T.onImageMuted,
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
    fontFamily: T.displayBold,
    fontSize: 19,
    letterSpacing: -0.4,
    color: T.onImage,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: T.bodyMed,
    fontSize: 12,
    color: T.onImageMuted,
  },
  muscleRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  muscleChip: {
    backgroundColor: T.onImageGlass,
    borderWidth: 1,
    borderColor: T.onImageBorder,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  muscleChipText: {
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 0.2,
    color: T.onImage,
  },
});
