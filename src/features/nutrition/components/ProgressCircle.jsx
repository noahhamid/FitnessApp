import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS } from "@/src/theme";

/**
 * Animated circular progress ring
 * @param {number} pct - Progress percentage (0-100)
 * @param {number} size - Ring diameter
 * @param {number} stroke - Ring stroke width
 * @param {string} color - Ring color
 * @param {string} label - Center label text
 * @param {string} sub - Subtitle text
 */
export function ProgressCircle({ pct, size = 130, stroke = 12, color = COLORS.accent, label, sub }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background track */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: COLORS.border,
        }}
      />

      {/* Filled progress (quadrant borders trick) */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: 'transparent',
          borderTopColor: pct > 0 ? color : 'transparent',
          borderRightColor: pct > 25 ? color : 'transparent',
          borderBottomColor: pct > 50 ? color : 'transparent',
          borderLeftColor: pct > 75 ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
          shadowColor: color,
          shadowOpacity: 0.4,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        }}
      />

      {/* Center text */}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text }}>{label}</Text>
        {sub && <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{sub}</Text>}
      </View>
    </View>
  );
}