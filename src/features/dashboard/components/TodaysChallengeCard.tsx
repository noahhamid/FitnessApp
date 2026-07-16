import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Pressable,
  ImageSourcePropType,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ArrowUpRight, Zap } from "lucide-react-native";

// ─── Theme tokens ────────────────────────────────────────────────────────────

const T = {
  lime: "#D4F445",
  limeDeep: "#B9DE1F",
  black: "#0B0D0F",
};

const FONT_DISPLAY = "SpaceGrotesk_700Bold";
const FONT_BODY = "Inter_500Medium";
const FONT_BODY_SEMIBOLD = "Inter_600SemiBold";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TodaysChallengeCardProps {
  title?: string;
  subtitle?: string;
  tag?: string;
  /** Transparent-background PNG/WEBP cutout — no cover photo needed. */
  image: ImageSourcePropType;
  onPress?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TodaysChallengeCard({
  title = "Today's Challenge",
  subtitle = "Do your plan before 9:00 AM",
  tag = "Cardio",
  image,
  onPress,
}: TodaysChallengeCardProps) {
  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 10,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={s.card}>
          {/* ---- Decorative backdrop layers ---------------------------- */}
          <View style={s.blobLarge} />
          <View style={s.blobSmall} />

          {/* ---- Dot-grid texture — sits in the empty bottom-left corner,
              well clear of both the copy above and the CTA on the right */}
          <DotGrid />

          {/* ---- Ground shadow anchoring the cutout -------------------- */}
          <View style={s.groundShadow} />

          {/* ---- Subject cutout (transparent PNG) ---------------------- */}
          <Image source={image} style={s.subjectImage} resizeMode="contain" />

          {/* ---- Foreground content -------------------------------------- */}
          <View style={s.content}>
            <View style={s.tagPill}>
              <Zap size={11} color={T.black} fill={T.black} />
              <Text style={s.tagText}>{tag}</Text>
            </View>

            <Text style={s.title}>{title}</Text>
            <Text style={s.subtitle}>{subtitle}</Text>
          </View>

          {/* ---- Floating CTA -------------------------------------------- */}
          {/* Pinned bottom-right, floating over the cutout rather than the
              text column, so it never competes with the copy on the left. */}
          <View style={s.ctaButton}>
            <ArrowUpRight size={18} color={T.lime} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Subtle dot-grid texture (bottom-left corner) ───────────────────────────

function DotGrid() {
  const rows = 3;
  const cols = 4;
  const spacing = 8;

  return (
    <Svg width={cols * spacing} height={rows * spacing} style={s.dotGrid}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <Circle
            key={`${r}-${c}`}
            cx={c * spacing + spacing / 2}
            cy={r * spacing + spacing / 2}
            r={1.4}
            fill="rgba(11,13,15,0.35)"
          />
        )),
      )}
    </Svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_HEIGHT = 176;

const s = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: 28,
    backgroundColor: T.lime,
    overflow: "hidden",
    position: "relative",
  },

  // Decorative layers
  blobLarge: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: T.limeDeep,
    top: -90,
    right: -50,
    opacity: 0.55,
  },
  blobSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(11,13,15,0.06)",
    bottom: -30,
    right: 70,
  },
  dotGrid: {
    position: "absolute",
    left: 22,
    bottom: 20,
  },
  groundShadow: {
    position: "absolute",
    right: 56,
    bottom: 14,
    width: 76,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(11,13,15,0.18)",
  },

  // Subject cutout image
  subjectImage: {
    position: "absolute",
    right: -6,
    bottom: 0,
    height: CARD_HEIGHT + 16,
    width: 168,
  },

  // Text content
  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    maxWidth: "58%",
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(11,13,15,0.1)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
    gap: 4,
  },
  tagText: {
    color: T.black,
    fontSize: 11,
    fontFamily: FONT_BODY_SEMIBOLD,
  },
  title: {
    color: T.black,
    fontSize: 20,
    fontFamily: FONT_DISPLAY,
    lineHeight: 24,
  },
  subtitle: {
    color: "rgba(11,13,15,0.65)",
    fontSize: 12.5,
    fontFamily: FONT_BODY,
    marginTop: 6,
    lineHeight: 17,
  },

  // Floating CTA button — bottom-right, riding over the cutout's feet like a
  // pinned badge, well clear of the text column and the dot texture.
  ctaButton: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.black,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
