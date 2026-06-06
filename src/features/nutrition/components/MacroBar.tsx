import { COLORS } from "@/src/ui/tokens/colors";
import { spacing } from "@/src/ui/tokens/spacing";
import { FONTS } from "@/src/ui/tokens/typography";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  current: number;
  goal: number;
  color: string;
};

export function MacroBar({ label, current, goal, color }: Props) {
  // ✅ Guard against division by zero if goal hasn't loaded yet
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isOver = current > goal && goal > 0;
  const animW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ✅ Only animate when pct actually changes, not on every render
    Animated.timing(animW, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barWidth = animW.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={s.wrap}>
      {/* Label row */}
      <View style={s.labelRow}>
        <View style={s.labelLeft}>
          <View style={[s.dot, { backgroundColor: color }]} />
          <Text style={s.label}>{label}</Text>
          {isOver && (
            <View
              style={[
                s.overBadge,
                {
                  borderColor: COLORS.red + "40",
                  backgroundColor: COLORS.red + "15",
                },
              ]}
            >
              <Text style={s.overText}>OVER</Text>
            </View>
          )}
        </View>

        <View style={s.valueRow}>
          <Text style={[s.current, { color }]}>{Math.round(current)}g</Text>
          <Text style={s.separator}>/</Text>
          <Text style={s.goal}>{goal}g</Text>
          <Text style={[s.pctBadge, { color: isOver ? COLORS.red : color }]}>
            {Math.round(pct)}%
          </Text>
        </View>
      </View>

      {/* Track */}
      <View style={s.track}>
        <Animated.View
          style={[
            s.fill,
            {
              width: barWidth,
              backgroundColor: isOver ? COLORS.red : color,
              shadowColor: isOver ? COLORS.red : color,
            },
          ]}
        />
      </View>

      {/* Remaining */}
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
    marginBottom: spacing.md,
    gap: spacing.xs,
  },

  // Label row
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  overBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  overText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.red,
    letterSpacing: 0.5,
  },

  // Value row
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  current: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    lineHeight: 16,
  },
  separator: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
  },
  goal: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
  },
  pctBadge: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    marginLeft: 2,
  },

  // Track
  track: {
    height: 7,
    backgroundColor: COLORS.muted2,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  // Remaining hint
  remaining: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.muted,
  },
});
