import { Button } from "@/src/ui/components/Button";
import { C, FONTS } from "@/src/ui/tokens";
import { useEffect, useRef } from "react";
import { Animated, SafeAreaView, StyleSheet, Text, View } from "react-native";

type Props = { onNext: () => void };

export function ReadyScreen({ onNext }: Props) {
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Badge pops in
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Text slides up
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Button fades in
      Animated.delay(80),
      Animated.timing(btnOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.top}>
          {/* Animated badge */}
          <Animated.View
            style={[
              s.badgeWrap,
              { opacity: badgeOpacity, transform: [{ scale: badgeScale }] },
            ]}
          >
            <View style={s.badgeOuter}>
              <View style={s.badge}>
                <Text style={s.checkIcon}>✓</Text>
              </View>
            </View>
          </Animated.View>

          {/* Text block — fixed: plain string, no HTML entity */}
          <Animated.View
            style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}
          >
            <Text style={s.tagline}>SETUP COMPLETE</Text>
            <Text style={s.titleWhite}>YOU'RE</Text>
            <Text style={s.titleAccent}>READY.</Text>
            <Text style={s.body}>
              Your personalised plan is built.{"\n"}
              Time to lock in and get to work.
            </Text>
          </Animated.View>
        </View>

        {/* Stats row */}
        <Animated.View style={[s.statsRow, { opacity: textOpacity }]}>
          <View style={s.statItem}>
            <Text style={s.statVal}>2</Text>
            <Text style={s.statLabel}>STEPS DONE</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>100%</Text>
            <Text style={s.statLabel}>READY</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>0</Text>
            <Text style={s.statLabel}>EXCUSES</Text>
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[s.btnWrap, { opacity: btnOpacity }]}>
          <Button onPress={onNext}>ENTER THE APP →</Button>
          <Text style={s.disclaimer}>
            You can update your profile anytime in settings.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  top: { gap: 24 },
  badgeWrap: { alignItems: "flex-start" },
  badgeOuter: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: `${C.accent}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: { fontSize: 32, color: C.bg },
  tagline: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 2.5,
    color: C.accent,
    marginBottom: 10,
  },
  // Plain apostrophe — no HTML entity
  titleWhite: {
    fontFamily: FONTS.black,
    fontSize: 56,
    color: C.text,
    lineHeight: 56,
    letterSpacing: -1,
  },
  titleAccent: {
    fontFamily: FONTS.black,
    fontSize: 56,
    color: C.accent,
    lineHeight: 58,
    letterSpacing: -1,
    marginBottom: 16,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: C.muted,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: C.bg3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: { alignItems: "center", gap: 4 },
  statVal: {
    fontFamily: FONTS.black,
    fontSize: 22,
    color: C.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: C.muted,
    letterSpacing: 1.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: C.border,
  },
  btnWrap: { gap: 12 },
  disclaimer: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    opacity: 0.5,
  },
});
