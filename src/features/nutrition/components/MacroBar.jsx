import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS } from "@/src/theme";

/**
 * Animated macro nutrition bar (Protein, Carbs, Fat)
 * @param {string} label - Macro name
 * @param {number} current - Current amount
 * @param {number} goal - Goal amount
 * @param {string} color - Bar color
 */
export function MacroBar({ label, current, goal, color }) {
  const pct = Math.min((current / goal) * 100, 100);
  const animW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animW, {
      toValue: pct,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barWidth = animW.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Label + value */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: '500' }}>{label}</Text>
        <Text style={{ fontSize: 13, color }}>
          {current}
          <Text style={{ color: COLORS.muted }}> /{goal}g</Text>
        </Text>
      </View>

      {/* Track */}
      <View
        style={{
          height: 8,
          backgroundColor: COLORS.muted2,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Animated fill */}
        <Animated.View
          style={[
            {
              height: 8,
              backgroundColor: color,
              borderRadius: 4,
              shadowColor: color,
              shadowOpacity: 0.5,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 0 },
            },
            { width: barWidth },
          ]}
        />
      </View>
    </View>
  );
}