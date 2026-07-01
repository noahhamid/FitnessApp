import { Button } from "@/src/ui/components/Button";
import { ProgressDots } from "@/src/ui/components/ProgressDots";
import { C, FONTS } from "@/src/ui/tokens";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Theme ────────────────────────────────────────────────────────────────────

const T = {
  bg: "#121212", // deep matte charcoal
  gold: "#FFC700", // primary accent
  surface: "#1E1E1E", // card / input surfaces
  text: "#FFFFFF", // headlines
  muted: "#A0A0A0", // body copy
  border: "#2A2A2A", // subtle dividers
};

// ─── Slides ──────────────────────────────────────────────────────────────────

const { height: SH } = Dimensions.get("window");
const SLAB_H = SH * 0.42;

type Slide = {
  tag: string;
  tagColor: string;
  tagBg: string;
  slabBg: string;
  lines: { w: number; x: number; y: number; opacity: number }[];
  stat: { value: string; label: string };
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    // Slide 1 — gold slab, dark tag text (charcoal on gold)
    tag: "TRACK",
    tagColor: T.bg,
    tagBg: "rgba(18,18,18,0.18)",
    slabBg: T.gold,
    lines: [
      { w: 80, x: 32, y: 0.42, opacity: 0.15 },
      { w: 56, x: 64, y: 0.55, opacity: 0.1 },
      { w: 96, x: 20, y: 0.68, opacity: 0.12 },
    ],
    stat: { value: "142 KG", label: "LIFTED TODAY" },
    title: "EVERY\nREP\nCOUNTS.",
    body: "Log workouts, track weight, and monitor your metrics with military precision.",
  },
  {
    // Slide 2 — dark navy slab, gold accents
    tag: "FOCUS",
    tagColor: T.gold,
    tagBg: "rgba(255,199,0,0.12)",
    slabBg: "#0d0d1a",
    lines: [
      { w: 60, x: 40, y: 0.38, opacity: 0.2 },
      { w: 100, x: 16, y: 0.52, opacity: 0.15 },
      { w: 44, x: 72, y: 0.68, opacity: 0.1 },
    ],
    stat: { value: "38:52", label: "DEEP FOCUS" },
    title: "LOCK IN.\nNO\nEXCUSES.",
    body: "PotentialPeak Focus Mode blocks distractions so you train with full intensity.",
  },
  {
    // Slide 3 — dark forest slab, gold accents
    tag: "GROW",
    tagColor: T.gold,
    tagBg: "rgba(255,199,0,0.12)",
    slabBg: "#091a09",
    lines: [
      { w: 72, x: 24, y: 0.4, opacity: 0.18 },
      { w: 48, x: 56, y: 0.56, opacity: 0.12 },
      { w: 88, x: 12, y: 0.7, opacity: 0.1 },
    ],
    stat: { value: "-3.2 KG", label: "THIS MONTH" },
    title: "PEAK IS\nNOT A\nDESTINATION.",
    body: "Build unstoppable habits and watch your body transform week over week.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type Props = { onNext: () => void };

export function WelcomeSlides({ onNext }: Props) {
  const insets = useSafeAreaInsets();
  const [slide, setSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const cur = SLIDES[slide];

  const animateToSlide = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 130,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -16,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSlide(next);
      slideAnim.setValue(16);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 170,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 170,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const advance = () => {
    if (slide < SLIDES.length - 1) animateToSlide(slide + 1);
    else onNext();
  };

  const goBack = () => {
    if (slide > 0) animateToSlide(slide - 1);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Hero slab ───────────────────────────────────────────────────── */}
      <Animated.View
        style={[s.slab, { backgroundColor: cur.slabBg }, { opacity: fadeAnim }]}
      >
        {/* Decorative speed lines */}
        {cur.lines.map((l, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              height: 2,
              width: `${l.w}%`,
              left: `${l.x}%`,
              top: SLAB_H * l.y,
              backgroundColor: cur.tagColor,
              opacity: l.opacity,
              borderRadius: 1,
            }}
          />
        ))}

        {/* Category tag */}
        <View style={[s.tagPill, { backgroundColor: cur.tagBg }]}>
          <Text style={[s.tagText, { color: cur.tagColor }]}>{cur.tag}</Text>
        </View>

        {/* Stat */}
        <View style={s.statBlock}>
          <Text style={[s.statValue, { color: cur.tagColor }]}>
            {cur.stat.value}
          </Text>
          <Text style={[s.statLabel, { color: cur.tagColor }]}>
            {cur.stat.label}
          </Text>
        </View>
      </Animated.View>

      {/* ── Copy ────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={s.title}>{cur.title}</Text>
        <Text style={s.body}>{cur.body}</Text>
      </Animated.View>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <View style={[s.nav, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {/* Progress dots — gold pill for active, dark chip for inactive */}
        <View style={s.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[s.dot, i === slide ? s.dotActive : s.dotInactive]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={s.navBtns}>
          {slide > 0 && (
            <Pressable style={s.backBtn} onPress={goBack}>
              <Text style={s.backText}>← BACK</Text>
            </Pressable>
          )}
          <Button
            onPress={advance}
            style={[s.nextBtn, slide > 0 && { marginLeft: 12 }]}
          >
            {slide < SLIDES.length - 1 ? "NEXT →" : "LET'S GO →"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: T.bg,
  },

  // Hero slab
  slab: {
    height: SLAB_H,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingTop: 52,
    paddingHorizontal: 28,
    paddingBottom: 28,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  tagPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  statBlock: { gap: 3 },
  statValue: {
    fontFamily: FONTS.black,
    fontSize: 42,
    letterSpacing: -1,
    lineHeight: 46,
  },
  statLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 2.5,
    opacity: 0.6,
  },

  // Copy
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 50,
    color: T.text,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: FONTS.regular,
    color: T.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },

  // Navigation
  nav: {
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: T.gold,
  },
  dotInactive: {
    width: 8,
    backgroundColor: T.border,
  },
  navBtns: {
    flexDirection: "row",
  },
  backBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: T.text,
    letterSpacing: 1,
  },
  nextBtn: {
    flex: 2,
    // Button component should be styled with:
    // backgroundColor: T.gold, borderRadius: 14,
    // color: T.bg (charcoal text on gold), paddingVertical: 17
    // Pass these via your Button's variant prop or override style.
  },
});
