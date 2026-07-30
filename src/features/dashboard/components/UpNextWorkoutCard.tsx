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
import { T } from "@/src/theme";
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
  const arrowNudge = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(entrance, {
      toValue: 1,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();

    // A quiet, slow nudge on the CTA arrow — the one place motion is
    // allowed to idle, so it reads as an invitation rather than noise.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowNudge, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(arrowNudge, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(600),
      ]),
    );
    loop.start();

    return () => {
      anim.stop();
      loop.stop();
    };
  }, []);

  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const onLoad = useCallback(() => setImgStatus("loaded"), []);
  const onError = useCallback(() => setImgStatus("error"), []);

  const imageScale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [1.06, 1],
  });
  const arrowX = arrowNudge.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

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
          <View style={s.imageClip}>
            {imgStatus !== "error" ? (
              <Animated.Image
                source={{ uri: imageUrl }}
                style={[s.image, { transform: [{ scale: imageScale }] }]}
                resizeMode="cover"
                onLoad={onLoad}
                onError={onError}
              />
            ) : (
              <View style={s.imageFallback}>
                <Dumbbell size={26} color={T.muted} strokeWidth={1.6} />
              </View>
            )}
          </View>

          {/* warm-black gradient, matching T.bg instead of a cool off-palette black */}
          <LinearGradient
            colors={[
              "rgba(14,13,12,0.12)",
              "rgba(14,13,12,0.38)",
              "rgba(14,13,12,0.96)",
            ]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          {/* eyebrow — plain text on the image, not a pill */}
          <View style={s.eyebrowRow}>
            <View style={s.eyebrowDot} />
            <Text style={s.eyebrow}>UP NEXT · {tag.toUpperCase()}</Text>
          </View>

          {/* floating duration chip — glances the one number people
              check first, before they've committed to reading the card */}
          <View style={s.durationChip}>
            <Clock size={11} color={T.onImage} strokeWidth={2.4} />
            <Text style={s.durationChipText}>{minutes}′</Text>
          </View>

          <View style={s.bottom}>
            {/* two-line headline, mixed weight: the first line carries
                the full extra-bold display weight, the second sits one
                step down — a quiet hierarchy inside a single title
                instead of two lines shouting at the same volume */}
            <Text style={s.headlineStrong}>{line1}</Text>
            <Text style={s.headlineLight}>{line2}</Text>

            <View style={s.metaRow}>
              <Flame size={12} color={T.muted} strokeWidth={2.2} />
              <Text style={s.metaText}>
                {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
              </Text>
            </View>

            <PressableScale
              onPress={onStartPress ?? onPress}
              scaleTo={0.96}
              style={s.ctaPressable}
            >
              <View style={s.cta}>
                <Text style={s.ctaText}>Start workout</Text>
                <Animated.View style={{ transform: [{ translateX: arrowX }] }}>
                  <ArrowRight size={15} color={T.bg} strokeWidth={2.4} />
                </Animated.View>
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
  pressableReset: { borderRadius: T.radius.xl },
  card: {
    height: 224,
    borderRadius: T.radius.xl,
    overflow: "hidden",
    backgroundColor: T.bg,
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  imageClip: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  image: { ...StyleSheet.absoluteFillObject },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.glass,
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
    color: T.onImage,
  },

  durationChip: {
    position: "absolute",
    top: 14,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.onImageGlass,
    borderWidth: 1,
    borderColor: T.onImageBorder,
    borderRadius: T.radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  durationChipText: {
    fontFamily: T.bodyBold,
    fontSize: 11.5,
    color: T.onImage,
    fontVariant: ["tabular-nums"],
  },

  bottom: { position: "absolute", left: 18, right: 18, bottom: 16 },
  headlineStrong: {
    fontFamily: T.displayExtraBold,
    fontSize: 25,
    lineHeight: 27,
    color: T.onImage,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  headlineLight: {
    fontFamily: T.display,
    fontSize: 21,
    lineHeight: 24,
    color: "rgba(255,255,255,0.82)",
    letterSpacing: -0.3,
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  metaText: { fontFamily: T.bodyMed, fontSize: 11.5, color: T.onImageMuted },

  ctaPressable: { alignSelf: "flex-start", borderRadius: T.radius.pill },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: T.accent,
    borderRadius: T.radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  ctaText: { fontFamily: T.bodyBold, fontSize: 13, color: T.onImage },
});
