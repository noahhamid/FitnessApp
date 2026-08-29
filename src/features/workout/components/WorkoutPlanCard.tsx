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
import { Dumbbell, Play, CheckCircle2 } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

type Props = {
  title: string;
  tag: string;
  minutes: number;
  exerciseCount: number;
  muscles: string;
  imageUrl: string;
  /** When set, shows the accent CTA under the metadata (Today). Omit on browse/full-plan. */
  ctaLabel?: string;
  /** Today's lifting session already finished — show completed state instead of Start. */
  completed?: boolean;
  onPress?: () => void;
  entranceDelay?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function WorkoutPlanCardBase({
  title,
  tag,
  minutes,
  exerciseCount,
  muscles,
  imageUrl,
  ctaLabel,
  completed = false,
  onPress,
  entranceDelay = 0,
  style,
  testID,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const scale = useRef(new Animated.Value(1)).current;
  const pressOpacity = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    if (!onPress) return;
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
  }, [scale, pressOpacity, onPress]);

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
    imageUrl ? "loading" : "error",
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

  const meta = `${formatDuration(minutes)} · ${exerciseCount} ${
    exerciseCount === 1 ? "exercise" : "exercises"
  } · ${muscles || "Full body"}`;

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
      <Animated.View style={[s.card, { opacity: pressOpacity }]}>
        {/* Photo hero */}
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={!onPress}
          testID={testID}
          accessibilityRole={onPress ? "button" : undefined}
          accessibilityLabel={`Start ${title}, ${tag}, ${meta}`}
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

            <View style={s.tagPill}>
              <Text style={s.tagText} numberOfLines={1}>
                {completed ? `Done · ${tag}` : tag}
              </Text>
            </View>

            <View
              style={[s.playBtn, completed && s.playBtnDone]}
              pointerEvents="none"
            >
              {completed ? (
                <CheckCircle2
                  size={22}
                  color={T.accent}
                  strokeWidth={2.4}
                />
              ) : (
                <Play
                  size={22}
                  color={T.onImage}
                  strokeWidth={2.4}
                  fill={T.onImage}
                />
              )}
            </View>
          </View>
        </Pressable>

        {/* Body */}
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={!onPress}
          style={s.body}
        >
          <Text style={s.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          <Text style={s.meta} numberOfLines={1}>
            {meta}
          </Text>

          {completed ? (
            <View style={s.doneCta}>
              <CheckCircle2 size={14} color={T.accent} strokeWidth={2.5} />
              <Text style={s.doneCtaText}>Completed</Text>
            </View>
          ) : ctaLabel ? (
            <Pressable
              onPress={onPress}
              disabled={!onPress}
              accessibilityRole="button"
              accessibilityLabel={`${ctaLabel}, ${title}`}
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
              <Text style={s.ctaText}>{ctaLabel}</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export const WorkoutPlanCard = memo(WorkoutPlanCardBase);

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.md,
      overflow: "hidden",
      marginBottom: 14,
      backgroundColor: T.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
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
      backgroundColor: "rgba(255,255,255,0.10)",
    },
    imageFallback: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: T.accentTint,
    },
    tagPill: {
      position: "absolute",
      top: 12,
      left: 14,
      maxWidth: 140,
      backgroundColor: T.onImageGlass,
      borderWidth: 1,
      borderColor: T.onImageBorder,
      borderRadius: T.radius.pill,
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
    playBtnDone: {
      paddingLeft: 0,
      backgroundColor: T.accentTint,
      borderColor: T.accent,
    },
    body: {
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 14,
      gap: 6,
    },
    title: {
      fontFamily: T.display,
      fontSize: 16,
      letterSpacing: -0.2,
      color: T.white,
    },
    meta: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
    },
    cta: {
      marginTop: 8,
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
    doneCta: {
      marginTop: 8,
      height: 40,
      borderRadius: T.radius.sm,
      backgroundColor: T.accentTint,
      borderWidth: 1,
      borderColor: T.accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    doneCtaText: {
      fontFamily: T.bodySemi,
      fontSize: 14,
      color: T.accent,
    },
  });
}
