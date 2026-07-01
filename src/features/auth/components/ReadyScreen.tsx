// src/features/onboarding/screens/ReadyScreen.tsx

import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#121212",
  surface: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#FFC700",
  text: "#FFFFFF",
  muted: "#A0A0A0",
  dim: "#555555",
};

type Props = {
  onNext: () => void;
  goalLabel?: string; // e.g. "Build Muscle"
  dailyCalories?: number; // e.g. 2800
  proteinG?: number; // e.g. 185
};

export function ReadyScreen({
  onNext,
  goalLabel = "Build Muscle",
  dailyCalories = 2800,
  proteinG = 185,
}: Props) {
  const insets = useSafeAreaInsets();

  // ── Animation refs ──────────────────────────────────────────────────────────
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current; // gold rule under eyebrow
  const headY = useRef(new Animated.Value(28)).current;
  const headOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Check badge pops in
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      // 2. Gold rule draws across
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      // 3. Headline rises
      Animated.parallel([
        Animated.timing(headOpacity, {
          toValue: 1,
          duration: 340,
          useNativeDriver: true,
        }),
        Animated.spring(headY, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(60),
      // 4. Plan card slides up
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(cardY, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(80),
      // 5. Button fades in last
      Animated.timing(btnOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[s.root, { paddingTop: insets.top + 40 }]}>
      {/* ── Check badge ──────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.badgeWrap,
          { opacity: checkOpacity, transform: [{ scale: checkScale }] },
        ]}
      >
        <View style={s.badge}>
          <View style={s.checkArm} />
          {/* Simple geometric check using two rotated bars */}
          <Text style={s.checkGlyph}>✓</Text>
        </View>
      </Animated.View>

      {/* ── Eyebrow + gold rule ──────────────────────────────────────────── */}
      <View style={s.eyebrowRow}>
        <Text style={s.eyebrow}>PLAN ACTIVATED</Text>
        <Animated.View
          style={[s.rule, { transform: [{ scaleX: lineWidth }] }]}
        />
      </View>

      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <Animated.View
        style={{ opacity: headOpacity, transform: [{ translateY: headY }] }}
      >
        <Text style={s.headWhite}>YOU ARE</Text>
        <Text style={s.headGold}>READY.</Text>
        <Text style={s.sub}>
          Your personalised plan is locked in.{"\n"}Everything is set — time to
          execute.
        </Text>
      </Animated.View>

      {/* ── Plan summary card ────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.card,
          { opacity: cardOpacity, transform: [{ translateY: cardY }] },
        ]}
      >
        {/* Top accent bar */}
        <View style={s.cardAccentBar} />

        <View style={s.cardBody}>
          <View style={s.cardRow}>
            <Text style={s.cardLabel}>GOAL</Text>
            <Text style={s.cardValue}>{goalLabel}</Text>
          </View>
          <View style={s.cardDivider} />
          <View style={s.cardRow}>
            <Text style={s.cardLabel}>DAILY CALORIES</Text>
            <Text style={s.cardValue}>
              {dailyCalories.toLocaleString()}
              <Text style={s.cardUnit}> kcal</Text>
            </Text>
          </View>
          <View style={s.cardDivider} />
          <View style={s.cardRow}>
            <Text style={s.cardLabel}>PROTEIN TARGET</Text>
            <Text style={s.cardValue}>
              {proteinG}
              <Text style={s.cardUnit}> g / day</Text>
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Spacer pushes button to bottom ───────────────────────────────── */}
      <View style={{ flex: 1 }} />

      {/* ── CTA button ───────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.btnWrap,
          {
            opacity: btnOpacity,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <Pressable
          onPress={onNext}
          style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
        >
          <Text style={s.btnLabel}>LET'S TRAIN →</Text>
        </Pressable>
        <Text style={s.disclaimer}>
          Update your profile anytime in settings.
        </Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 28,
  },

  // ── Badge ──────────────────────────────────────────────────────────────────
  badge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  badgeWrap: {
    alignItems: "flex-start",
  },
  checkArm: {
    position: "absolute",
  },
  checkGlyph: {
    fontSize: 30,
    color: C.bg,
    fontWeight: "900",
    lineHeight: 36,
  },

  // ── Eyebrow ────────────────────────────────────────────────────────────────
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 3,
    color: C.accent,
    fontWeight: "700",
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: C.accent,
    opacity: 0.4,
    transformOrigin: "left",
  },

  // ── Headline ───────────────────────────────────────────────────────────────
  headWhite: {
    fontSize: 58,
    lineHeight: 58,
    color: C.text,
    fontWeight: "900",
    letterSpacing: -1.5,
    textTransform: "uppercase",
  },
  headGold: {
    fontSize: 58,
    lineHeight: 62,
    color: C.accent,
    fontWeight: "900",
    letterSpacing: -1.5,
    textTransform: "uppercase",
    marginBottom: 18,
  },
  sub: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 22,
    marginBottom: 32,
  },

  // ── Plan card ──────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardAccentBar: {
    height: 3,
    backgroundColor: C.accent,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: C.border,
  },
  cardLabel: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: C.dim,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 15,
    color: C.text,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  cardUnit: {
    fontSize: 13,
    color: C.muted,
    fontWeight: "400",
  },

  // ── CTA ────────────────────────────────────────────────────────────────────
  btnWrap: {
    gap: 14,
  },
  btn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  btnLabel: {
    fontSize: 15,
    letterSpacing: 2.5,
    color: C.bg,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  disclaimer: {
    fontSize: 11,
    color: C.dim,
    textAlign: "center",
    lineHeight: 16,
  },
});
