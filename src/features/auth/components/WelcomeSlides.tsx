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

const { height: SH } = Dimensions.get("window");

type Props = { onNext: () => void };

const SLIDES = [
  {
    tag: "TRACK",
    title: "EVERY\nREP\nCOUNTS.",
    body: "Log workouts, track weight, and monitor your metrics with military precision.",
    slabColor: C.accent,
    tagBg: `${C.bg}28`,
    tagColor: C.bg,
    lines: [
      { w: 80, x: 32, y: 0.42, opacity: 0.15 },
      { w: 56, x: 64, y: 0.52, opacity: 0.1 },
      { w: 96, x: 20, y: 0.62, opacity: 0.12 },
    ],
    stat: { value: "142", label: "KG LIFTED TODAY" },
  },
  {
    tag: "FOCUS",
    title: "LOCK IN.\nNO\nEXCUSES.",
    body: "PotentialPeak Focus Mode blocks distractions so you train with full intensity.",
    slabColor: "#0d0d1a",
    tagBg: `${C.accent}28`,
    tagColor: C.accent,
    lines: [
      { w: 60, x: 40, y: 0.38, opacity: 0.2 },
      { w: 100, x: 16, y: 0.5, opacity: 0.15 },
      { w: 44, x: 72, y: 0.62, opacity: 0.1 },
    ],
    stat: { value: "38:52", label: "DEEP FOCUS" },
  },
  {
    tag: "GROW",
    title: "PEAK IS\nNOT A\nDESTINATION.",
    body: "Build unstoppable habits and watch your body transform week over week.",
    slabColor: "#091a09",
    tagBg: `${C.accent}28`,
    tagColor: C.accent,
    lines: [
      { w: 72, x: 24, y: 0.4, opacity: 0.18 },
      { w: 48, x: 56, y: 0.54, opacity: 0.12 },
      { w: 88, x: 12, y: 0.66, opacity: 0.1 },
    ],
    stat: { value: "-3.2KG", label: "THIS MONTH" },
  },
];

const SLAB_H = SH * 0.44;

export function WelcomeSlides({ onNext }: Props) {
  const [slide, setSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const cur = SLIDES[slide];

  const animateToSlide = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSlide(next);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
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
      {/* Slab */}
      <Animated.View
        style={[
          s.slab,
          { backgroundColor: cur.slabColor },
          { opacity: fadeAnim },
        ]}
      >
        {/* Decorative horizontal bars */}
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

        {/* Tag pill */}
        <View style={[s.tag, { backgroundColor: cur.tagBg }]}>
          <Text style={[s.tagText, { color: cur.tagColor }]}>{cur.tag}</Text>
        </View>

        {/* Stat block */}
        <View style={s.statBlock}>
          <Text style={[s.statValue, { color: cur.tagColor }]}>
            {cur.stat.value}
          </Text>
          <Text style={[s.statLabel, { color: cur.tagColor, opacity: 0.6 }]}>
            {cur.stat.label}
          </Text>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[
          s.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={s.title}>{cur.title}</Text>
        <Text style={s.body}>{cur.body}</Text>
      </Animated.View>

      {/* Nav */}
      <View style={s.nav}>
        <ProgressDots total={SLIDES.length} current={slide} />
        <View style={s.navBtns}>
          {slide > 0 && (
            <Pressable style={s.backBtn} onPress={goBack}>
              <Text style={s.backText}>BACK</Text>
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  slab: {
    height: SLAB_H,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 52,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingBottom: 32,
    overflow: "hidden",
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, fontFamily: FONTS.bold, letterSpacing: 2 },
  statBlock: { gap: 2 },
  statValue: {
    fontFamily: FONTS.black,
    fontSize: 44,
    letterSpacing: -1,
    lineHeight: 48,
  },
  statLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 28,
    flex: 1,
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 48,
    color: C.text,
    lineHeight: 50,
    letterSpacing: -0.5,
  },
  body: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 16,
    fontFamily: FONTS.regular,
  },
  nav: { paddingHorizontal: 32, paddingBottom: 40 },
  navBtns: { flexDirection: "row", marginTop: 12 },
  backBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: C.text,
    letterSpacing: 0.8,
  },
  nextBtn: { flex: 2 },
});
