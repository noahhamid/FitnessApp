import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useRef } from 'react';
import { COLORS } from "@/src/theme";

/**
 * Generic stat card (used for calories, weight, etc)
 */
export function StatsCard({ label, value, unit, color = COLORS.text }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color }}>
        {value}
        <Text style={{ fontSize: 14, color: COLORS.muted }}> {unit}</Text>
      </Text>
    </View>
  );
}

/**
 * Large button with press animation
 */
export function PrimaryButton({ label, onPress, outline = false, color = COLORS.accent, small = false }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginVertical: 12 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[
          {
            paddingVertical: small ? 10 : 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: outline ? 2 : 0,
            borderColor: outline ? COLORS.border : 'transparent',
            backgroundColor: outline ? 'transparent' : color,
            shadowColor: !outline ? color : 'transparent',
            shadowOpacity: !outline ? 0.3 : 0,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          },
        ]}
      >
        <Text
          style={{
            fontSize: small ? 13 : 14,
            fontWeight: '600',
            color: outline ? COLORS.text : COLORS.bg,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Section header with optional action
 */
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text, textTransform: 'uppercase' }}>
        {title}
      </Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontSize: 12, color: COLORS.accent, fontWeight: '600' }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Tab navigation pills
 */
export function TabBar({ tabs, active, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, backgroundColor: COLORS.bg2, padding: 8, borderRadius: 10, marginBottom: 16 }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onChange(tab)}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: active === tab ? COLORS.accent : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: active === tab ? '700' : '500',
              color: active === tab ? COLORS.bg : COLORS.text,
            }}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}