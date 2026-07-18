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
import { Dumbbell, ArrowRight, Clock, Flame } from "lucide-react-native";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

type Props = {
  title: string; // "Chest & Triceps" — split onto two lines around " & " / " and " if present
  tag: string; // "Push Day"
  minutes: number;
  exerciseCount: number;
  imageUrl: string;
  onPress?: () => void;
  onStartPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

function splitHeadline(title: string): [string, string] {
  const match = title.match(/^(.+?)\s*(&|and)\s*(.+)$/i);
  if (match) return [match[1].trim(), match[3].trim()];
  const words = title.split(" ");
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function UpNextWorkoutCardBase({
  title,
  tag,
  minutes,
  exerciseCount,
  imageUrl,
  onPress,
  onStartPress,
  style,
}: Props) {
  const [line1, line2] = splitHeadline(title);

  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(entrance, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, []);

  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
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
        style={s.pressableReset}
      >
        <View style={s.card}>
          {imgStatus !== "error" ? (
            <Image
              source={{ uri: imageUrl }}
              style={s.image}
              resizeMode="cover"
              onLoad={onLoad}
              onError={onError}
            />
          ) : (
            <View style={s.imageFallback}>
              <Dumbbell size={26} color={T.muted} strokeWidth={1.6} />
            </View>
          )}

          <LinearGradient
            colors={[
              "rgba(9,9,12,0.15)",
              "rgba(9,9,12,0.35)",
              "rgba(9,9,12,0.95)",
            ]}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          {/* eyebrow — plain text on the image, not a pill, so it reads differently from WorkoutPlanCard's tag chip */}
          <View style={s.eyebrowRow}>
            <View style={s.eyebrowDot} />
            <Text style={s.eyebrow}>UP NEXT · {tag.toUpperCase()}</Text>
          </View>

          <View style={s.bottom}>
            {/* two-line display headline instead of a single truncated title */}
            <Text style={s.headline}>
              {line1}
              {"\n"}
              {line2}
            </Text>

            {/* inline meta row instead of chip row */}
            <View style={s.metaRow}>
              <View style={s.metaItem}>
                <Clock size={12} color={T.muted} strokeWidth={2.2} />
                <Text style={s.metaText}>{minutes} min</Text>
              </View>
              <View style={s.metaDivider} />
              <View style={s.metaItem}>
                <Flame size={12} color={T.muted} strokeWidth={2.2} />
                <Text style={s.metaText}>
                  {exerciseCount}{" "}
                  {exerciseCount === 1 ? "exercise" : "exercises"}
                </Text>
              </View>
            </View>

            <PressableScale
              onPress={onStartPress ?? onPress}
              scaleTo={0.96}
              style={s.ctaPressable}
            >
              <View style={s.cta}>
                <Text style={s.ctaText}>Start workout</Text>
                <ArrowRight size={15} color={T.bg} strokeWidth={2.4} />
              </View>
            </PressableScale>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export const UpNextWorkoutCard = memo(UpNextWorkoutCardBase);

const s = StyleSheet.create({
  pressableReset: { borderRadius: 26 },
  card: {
    height: 220,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: T.bg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 7,
  },
  image: { ...StyleSheet.absoluteFillObject },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.bg,
  },

  eyebrowRow: {
    position: "absolute",
    top: 16,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eyebrowDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: T.accent,
  },
  eyebrow: {
    fontFamily: T.bodyBold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: T.white,
  },

  bottom: { position: "absolute", left: 18, right: 18, bottom: 16 },
  headline: {
    fontFamily: T.display,
    fontSize: 24,
    lineHeight: 27,
    color: T.white,
    letterSpacing: -0.4,
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontFamily: T.bodyMed, fontSize: 11.5, color: T.muted },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: T.muted,
  },

  ctaPressable: { alignSelf: "flex-start", borderRadius: 999 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: T.accent,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  ctaText: { fontFamily: T.bodyBold, fontSize: 13, color: T.bg },
});
