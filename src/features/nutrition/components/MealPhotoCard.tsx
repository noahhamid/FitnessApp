import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UtensilsCrossed } from "lucide-react-native";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

export type MealMacros = { carbs: number; protein: number; fat: number };

type Props = {
  slot: string; // "Breakfast", "Lunch", ...
  name: string;
  time: string; // "7:40 AM"
  calories: number;
  macros: MealMacros;
  imageUrl: string;
  onPress?: () => void;
  /** Optional delay (ms) before the entrance animation starts — for staggering list items */
  entranceDelay?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

function MealPhotoCardBase({
  slot,
  name,
  time,
  calories,
  macros,
  imageUrl,
  onPress,
  entranceDelay = 0,
  style,
  testID,
}: Props) {
  // --- entrance animation (same timing as WorkoutPlanCard) -------------
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

  // --- image load state (shimmer while loading, icon fallback on error) -
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

  const onLoad = useCallback(() => setImgStatus("loaded"), []);
  const onError = useCallback(() => setImgStatus("error"), []);

  return (
    <Animated.View
      style={[
        {
          opacity: entrance,
          transform: [
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
      <PressableScale
        onPress={onPress}
        disabled={!onPress}
        testID={testID}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={`${slot}, ${name}, ${calories} calories, logged at ${time}`}
        style={s.pressableReset}
      >
        <View style={s.card}>
          {imgStatus !== "error" ? (
            <>
              <Image
                source={{ uri: imageUrl }}
                style={s.image}
                resizeMode="cover"
                onLoad={onLoad}
                onError={onError}
                accessible
                accessibilityLabel={`${name} photo`}
              />
              {imgStatus === "loading" && (
                <Animated.View
                  style={[s.shimmerOverlay, { opacity: shimmer }]}
                />
              )}
            </>
          ) : (
            <View style={s.imageFallback}>
              <UtensilsCrossed size={28} color={T.muted} strokeWidth={1.6} />
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
              {slot}
            </Text>
          </View>

          {/* translucent ring — same treatment as the workout card's duration ring */}
          <View style={s.calRing}>
            <Text style={s.calValue}>{calories}</Text>
            <Text style={s.calUnit}>cal</Text>
          </View>

          <View style={s.bottomContent} pointerEvents="none">
            <Text style={s.title} numberOfLines={1} ellipsizeMode="tail">
              {name}
            </Text>
            <Text style={s.subtitle} numberOfLines={1}>
              Logged {time}
            </Text>
            <View style={s.macroRow}>
              <View style={s.macroChip}>
                <Text style={s.macroChipText}>C {macros.carbs}g</Text>
              </View>
              <View style={s.macroChip}>
                <Text style={s.macroChipText}>P {macros.protein}g</Text>
              </View>
              <View style={s.macroChip}>
                <Text style={s.macroChipText}>F {macros.fat}g</Text>
              </View>
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export const MealPhotoCard = memo(MealPhotoCardBase);

const s = StyleSheet.create({
  pressableReset: { borderRadius: 24 },
  card: {
    height: 168,
    borderRadius: 24,
    overflow: "hidden",
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

  calRing: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: T.ringBorder,
    backgroundColor: T.ringGlass,
    alignItems: "center",
    justifyContent: "center",
  },
  calValue: {
    fontFamily: T.display,
    fontSize: 12,
    lineHeight: 14,
    color: T.accent,
    fontVariant: ["tabular-nums"],
  },
  calUnit: {
    fontFamily: T.bodySemi,
    fontSize: 8,
    color: T.muted,
    marginTop: -1,
  },

  bottomContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 13,
    gap: 5,
  },
  title: {
    fontFamily: T.display,
    fontSize: 17,
    letterSpacing: -0.3,
    color: T.white,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  subtitle: { fontFamily: T.bodyMed, fontSize: 11.5, color: T.muted },
  macroRow: { flexDirection: "row", gap: 6, marginTop: 2 },
  macroChip: {
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  macroChipText: {
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 0.2,
    color: T.white,
  },
});
