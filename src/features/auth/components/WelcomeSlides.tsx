import { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { C, FONTS, SH } from "@/src/theme";
import { Button } from "@/src/ui/components/Button";
import { ProgressDots } from "@/src/ui/components/ProgressDots";

type Props = { onNext: () => void };

const SLIDES = [
  {
    tag: "TRACK",
    title: "EVERY\nREP\nCOUNTS.",
    body: "Log workouts, track weight, and monitor your metrics with military precision.",
    slabColor: C.accent,
    tagBg: `${C.bg}33`,
    tagColor: C.bg,
  },
  {
    tag: "FOCUS",
    title: "LOCK IN.\nNO\nEXCUSES.",
    body: "PotentialPeak Focus Mode blocks distractions so you train with full intensity.",
    slabColor: "#1a1a2e",
    tagBg: `${C.accent}33`,
    tagColor: C.accent,
  },
  {
    tag: "GROW",
    title: "PEAK IS\nNOT A\nDESTINATION.",
    body: "Build unstoppable habits and watch your body transform week over week.",
    slabColor: "#0d1f0d",
    tagBg: `${C.accent}33`,
    tagColor: C.accent,
  },
];

export function WelcomeSlides({ onNext }: Props) {
  const [slide, setSlide] = useState(0);
  const cur = SLIDES[slide];
  const advance = () => (slide < SLIDES.length - 1 ? setSlide((s) => s + 1) : onNext());

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ flex: 1 }}>
        <View style={[s.slab, { backgroundColor: cur.slabColor }]}>
          <View style={[s.tag, { backgroundColor: cur.tagBg }]}>
            <Text style={[s.tagText, { color: cur.tagColor }]}>{cur.tag}</Text>
          </View>
        </View>
        <View style={s.content}>
          <Text style={s.title}>{cur.title}</Text>
          <Text style={s.body}>{cur.body}</Text>
        </View>
        <View style={s.nav}>
          <ProgressDots total={SLIDES.length} current={slide} />
          <View style={s.navBtns}>
            {slide > 0 && (
              <Button outline onPress={() => setSlide((x) => x - 1)} style={s.flex1}>
                BACK
              </Button>
            )}
            <Button onPress={advance} style={[s.flex2, slide > 0 && { marginLeft: 12 }]}>
              {slide < SLIDES.length - 1 ? "NEXT" : "LET'S GO →"}
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  slab: {
    height: SH * 0.44,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "flex-start",
    paddingTop: 56,
    paddingHorizontal: 32,
  },
  tag: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontFamily: FONTS.bold, letterSpacing: 1.5 },
  content: { paddingHorizontal: 32, paddingTop: 24, flex: 1 },
  title: {
    fontFamily: FONTS.black,
    fontSize: 52,
    color: C.text,
    lineHeight: 54,
    letterSpacing: -0.5,
  },
  body: { color: C.muted, fontSize: 15, lineHeight: 24, marginTop: 16, fontFamily: FONTS.regular },
  nav: { paddingHorizontal: 32, paddingBottom: 40 },
  navBtns: { flexDirection: "row", marginTop: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
});
