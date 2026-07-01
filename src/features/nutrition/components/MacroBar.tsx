import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg3: "#252525", // Track background
  gold: "#FFC700", // Active fill
  red: "#FF453A", // Over-goal state
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

type Props = {
  label: string;
  current: number;
  goal: number;
};

export function MacroBar({ label, current, goal }: Props) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isOver = current > goal && goal > 0;
  const animW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animW, {
      toValue: pct,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barWidth = animW.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const activeColor = isOver ? T.red : T.gold;

  return (
    <View style={s.wrap}>
      {/* Label + values */}
      <View style={s.labelRow}>
        <View style={s.labelLeft}>
          <Text style={s.label}>{label}</Text>
          {isOver && (
            <View style={s.overBadge}>
              <Text style={s.overText}>OVER</Text>
            </View>
          )}
        </View>

        <View style={s.valueRow}>
          <Text style={[s.current, { color: activeColor }]}>
            {Math.round(current)}
          </Text>
          <Text style={s.separator}>/</Text>
          <Text style={s.goal}>{goal}g</Text>
          <Text style={[s.pct, { color: activeColor }]}>
            {Math.round(pct)}%
          </Text>
        </View>
      </View>

      {/* Progress track */}
      <View style={s.track}>
        <Animated.View
          style={[
            s.fill,
            {
              width: barWidth,
              backgroundColor: activeColor,
              shadowColor: activeColor,
            },
          ]}
        />
      </View>

      {/* Remaining hint */}
      <Text style={s.remaining}>
        {isOver
          ? `${Math.round(current - goal)}g over goal`
          : `${Math.round(goal - current)}g remaining`}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 6 },

  // Label row
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub, // Muted label — number is the hero
    letterSpacing: 0.3,
  },

  // OVER badge — red tint, no border
  overBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: T.red + "20",
  },
  overText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 9,
    color: T.red,
    letterSpacing: 1,
  },

  // Values
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  current: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 15,
    lineHeight: 17,
  },
  separator: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  goal: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  pct: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    marginLeft: 2,
  },

  // Track — 5px, no glow on track itself
  track: {
    height: 5,
    backgroundColor: T.bg3,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    shadowOpacity: 0.45,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },

  // Remaining
  remaining: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
});
