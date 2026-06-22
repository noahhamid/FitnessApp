import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const T = {
  bg3: "#222228",
  lime: "#C8F135",
  red: "#FF3D3D",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
};

type Props = {
  label: string;
  current: number;
  goal: number;
  color: string;
};

export function MacroBar({ label, current, goal, color }: Props) {
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

  const activeColor = isOver ? T.red : color;

  return (
    <View style={s.wrap}>
      {/* Label + values row */}
      <View style={s.labelRow}>
        <View style={s.labelLeft}>
          <View style={[s.dot, { backgroundColor: activeColor }]} />
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

      {/* Slim track */}
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
  wrap: {
    gap: 5,
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.text,
  },
  overBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: T.red + "18",
    borderWidth: 1,
    borderColor: T.red + "35",
  },
  overText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 9,
    color: T.red,
    letterSpacing: 0.5,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  current: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    lineHeight: 16,
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

  // Slim 5px track (down from 7px)
  track: {
    height: 5,
    backgroundColor: T.bg3,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    shadowOpacity: 0.55,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },

  remaining: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
});
