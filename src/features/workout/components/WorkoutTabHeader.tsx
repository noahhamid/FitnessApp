import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Bell } from "lucide-react-native";

// Font family strings + palette — same convention as the other components.
// Worth pulling into a shared theme.ts alongside them at some point.
const T = {
  text: "#FFFFFF",
  faint: "rgba(255,255,255,0.6)",
  accent: "#FFC700",
  panel: "#15161C",
  panelBorder: "rgba(255,255,255,0.10)",
  badge: "#FF5A5A",

  display: "SpaceGrotesk_700Bold",
  bodySemi: "Inter_600SemiBold",
};

type Props = {
  name: string;
  subtitle?: string;
  avatarUrl: string;
  hasNotification?: boolean;
  onPressBell?: () => void;
};

export function WorkoutTabHeader({
  name,
  subtitle = "Fitness Freak",
  avatarUrl,
  hasNotification = true,
  onPressBell,
}: Props) {
  // bell press feedback
  const bellScale = useRef(new Animated.Value(1)).current;
  const onBellPressIn = useCallback(() => {
    Animated.spring(bellScale, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  }, [bellScale]);
  const onBellPressOut = useCallback(() => {
    Animated.spring(bellScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 160,
    }).start();
  }, [bellScale]);

  // a soft ring pulses outward from the notification dot on a loop — only
  // while there's actually something to flag, so it never runs for nothing
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!hasNotification) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [hasNotification, pulse]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <View style={s.row}>
      <View style={s.left}>
        <View style={s.avatarRing}>
          <Image source={{ uri: avatarUrl }} style={s.avatar} />
        </View>

        <View>
          <Text style={s.greeting}>Hi {name}</Text>
          <View style={s.subtitleRow}>
            <View style={s.dot} />
            <Text style={s.subtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale: bellScale }] }}>
        <Pressable
          onPress={onPressBell}
          onPressIn={onBellPressIn}
          onPressOut={onBellPressOut}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={
            hasNotification ? "Notifications, unread" : "Notifications"
          }
          style={s.bellWrap}
        >
          <Bell size={20} color={T.text} strokeWidth={2} />
          {hasNotification && (
            <>
              <Animated.View
                pointerEvents="none"
                style={[
                  s.badgePulse,
                  { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
                ]}
              />
              <View style={s.badge} />
            </>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },

  // gold ring with a small gap before the photo, echoing the progress rings
  // used everywhere else in the app instead of a flat colored border
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: T.accent,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: "100%", height: "100%", borderRadius: 23 },

  greeting: {
    fontFamily: T.display,
    fontSize: 18,
    letterSpacing: -0.3,
    color: T.text,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: T.accent },
  subtitle: { fontFamily: T.bodySemi, fontSize: 12, color: T.faint },

  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  badgePulse: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.badge,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.badge,
    borderWidth: 1.5,
    borderColor: T.panel,
  },
});
