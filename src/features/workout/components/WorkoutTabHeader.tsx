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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Flame } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";
import { getGreeting } from "@/src/lib/greeting";
import { useWorkoutStreak } from "../hooks/useWorkoutStreak";

type Props = {
  name: string;
  /** Short line under the greeting. */
  subtitle?: string;
  avatarUrl: string;
  hasNotification?: boolean;
  onPressBell?: () => void;
};

export function WorkoutTabHeader({
  name,
  subtitle = "Ready to move today?",
  avatarUrl,
  hasNotification = true,
  onPressBell,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { streakDays } = useWorkoutStreak();
  const greeting = getGreeting();

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
    <View style={[s.row, { paddingTop: topInset(insets.top) + 8 }]}>
      <View style={s.left}>
        <View style={s.avatarRing}>
          <Image source={{ uri: avatarUrl }} style={s.avatar} />
        </View>

        <View style={s.copy}>
          <Text style={s.greeting} numberOfLines={1}>
            {greeting}, {name}
          </Text>
          <Text style={s.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={s.right}>
        <View
          style={s.streakBadge}
          accessibilityRole="text"
          accessibilityLabel={`${streakDays} day streak`}
        >
          <Flame size={13} color={T.onAccent} strokeWidth={2.4} />
          <Text style={s.streakText}>{streakDays}</Text>
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
            <Bell size={19} color={T.white} strokeWidth={2} />
            {hasNotification && (
              <>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    s.badgePulse,
                    {
                      opacity: pulseOpacity,
                      transform: [{ scale: pulseScale }],
                    },
                  ]}
                />
                <View style={s.badge} />
              </>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
      gap: 10,
    },
    left: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },
    copy: { flex: 1, minWidth: 0, gap: 3 },

    avatarRing: {
      width: 54,
      height: 54,
      borderRadius: 27,
      borderWidth: 1.5,
      borderColor: T.accent,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: { width: "100%", height: "100%", borderRadius: 23 },

    greeting: {
      fontFamily: T.displayBold,
      fontSize: 17,
      letterSpacing: -0.3,
      color: T.white,
    },
    subtitle: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.faint,
    },

    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 0,
    },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: T.accent,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 11,
    },
    streakText: {
      fontFamily: T.bodyBold,
      fontSize: 12,
      color: T.onAccent,
      fontVariant: ["tabular-nums"],
    },

    bellWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: T.bgElevated,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 1,
    },
    badgePulse: {
      position: "absolute",
      top: 9,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: T.badge,
    },
    badge: {
      position: "absolute",
      top: 9,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: T.badge,
      borderWidth: 1.5,
      borderColor: T.bg,
    },
  });
}
