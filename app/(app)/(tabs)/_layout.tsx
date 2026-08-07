import React, { useEffect, useMemo, useRef } from "react";
import { Tabs } from "expo-router";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Home, Dumbbell, UtensilsCrossed, LineChart, User } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/src/context/ThemeContext";
import type { AppTheme } from "@/src/theme";
import { bottomInset } from "@/src/lib/safe-area";

const IS_ANDROID = Platform.OS === "android";

const PILL_H = 64;
const PILL_H_MARGIN = 20;
const PILL_BOTTOM_GAP = 10;

/**
 * Pill glass fill tokens — slightly stronger than GlassSurface cards (short
 * surface). Top edge is a SINGLE border on the clip (no stacked highlight
 * strip). Shadow stays neutral black — never T.shadow.lifted.shadowColor
 * (#1C3F2E pine), which reads as a green glow around the pill.
 */
const PILL_GRADIENT_DARK = [
  "rgba(255,255,255,0.22)",
  "rgba(255,255,255,0.02)",
  "rgba(255,255,255,0.12)",
] as const;
const PILL_GRADIENT_LIGHT = [
  "rgba(255,255,255,0.55)",
  "rgba(255,255,255,0.15)",
  "rgba(10,10,10,0.04)",
] as const;

/** Inactive tab icons — accent at reduced alpha (same family as active, not T.muted gray). */
const INACTIVE_ICON_ALPHA = 0.78;

function accentAtAlpha(accent: string, alpha: number): string {
  const hex = accent.replace("#", "");
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  // Already rgba / named — fall back to accentLine-style soft if unexpected.
  return accent;
}

const TAB_META: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{
      size: number;
      color: string;
      strokeWidth: number;
    }>;
  }
> = {
  index: { label: "Home", icon: Home },
  train: { label: "Train", icon: Dumbbell },
  // UtensilsCrossed reads as "meals" at 22px more clearly than Apple (blob) or Salad (busy).
  nutrition: { label: "Nutrition", icon: UtensilsCrossed },
  progress: { label: "Progress", icon: LineChart },
  profile: { label: "Profile", icon: User },
};

function TabSlot({
  focused,
  label,
  icon: Icon,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  label: string;
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { theme: T } = useTheme();
  const s = useMemo(() => makeStyles(T), [T]);
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 140,
    }).start();
  }, [focused, anim]);

  const iconScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      style={s.slot}
    >
      {/* Subtle accent well on every tab — soft presence without fighting the active pill. */}
      <View
        pointerEvents="none"
        style={[s.idleWell, focused && s.idleWellHidden]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          s.activeWell,
          {
            opacity: anim,
            transform: [{ scale: anim }],
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale: iconScale }], zIndex: 1 }}>
        <Icon
          size={22}
          color={
            focused
              ? T.accent
              : accentAtAlpha(T.accent, INACTIVE_ICON_ALPHA)
          }
          strokeWidth={focused ? 2.2 : 2.6}
        />
      </Animated.View>
    </Pressable>
  );
}

/**
 * Android-only pill fill — faux-glass (no BlurView; dimezisBlurView bleeds).
 */
function AndroidFauxGlassFill({ isDark }: { isDark: boolean }) {
  const { theme: T } = useTheme();
  const gradientColors = isDark ? PILL_GRADIENT_DARK : PILL_GRADIENT_LIGHT;

  return (
    <>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: T.bgElevated }]}
      />
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </>
  );
}

function FloatingGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme: T, resolved } = useTheme();
  const s = useMemo(() => makeStyles(T), [T]);
  const bottom = bottomInset(insets.bottom) + PILL_BOTTOM_GAP;
  const isDark = resolved === "dark";

  const blurTint = isDark ? "dark" : "light";
  const blurIntensity = isDark ? 68 : 82;

  // Absolute overlay only — no reserved opaque strip. Scene content paints
  // through the margins around the pill (screens keep their own bottom pad).
  return (
    <View style={s.overlayRoot} pointerEvents="box-none">
      <View
        style={[
          s.pillWrap,
          {
            bottom,
            left: PILL_H_MARGIN,
            right: PILL_H_MARGIN,
          },
        ]}
      >
        <View style={s.pillClip}>
          {IS_ANDROID ? (
            <AndroidFauxGlassFill isDark={isDark} />
          ) : (
            <>
              <BlurView
                intensity={blurIntensity}
                tint={blurTint}
                style={StyleSheet.absoluteFill}
              />
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  s.pillVeil,
                  isDark ? s.pillVeilDark : s.pillVeilLight,
                ]}
              />
            </>
          )}
          <View style={s.row}>
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              const { options } = descriptors[route.key];
              const meta = TAB_META[route.name] ?? {
                label: options.title ?? route.name,
                icon: Home,
              };

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <TabSlot
                  key={route.key}
                  focused={focused}
                  label={meta.label}
                  icon={meta.icon}
                  onPress={onPress}
                  onLongPress={onLongPress}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function AppTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        // Transparent + absolute so the navigator doesn't paint a solid
        // DarkTheme strip under the floating pill.
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="train" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    overlayRoot: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "transparent",
    },
    pillWrap: {
      position: "absolute",
      height: PILL_H,
      backgroundColor: "transparent",
      // Neutral black lift — NOT T.shadow.lifted.shadowColor (#1C3F2E pine).
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 12,
    },
    pillClip: {
      flex: 1,
      borderRadius: T.radius.pill,
      overflow: "hidden",
      // One crisp edge — no separate top highlight strip / thicker top border.
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
      backgroundColor: "transparent",
    },
    pillVeil: {
      borderRadius: T.radius.pill,
    },
    pillVeilLight: {
      backgroundColor: "rgba(247,247,245,0.42)",
    },
    pillVeilDark: {
      backgroundColor: "rgba(14,14,16,0.52)",
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
    },
    slot: {
      flex: 1,
      height: PILL_H - 12,
      alignItems: "center",
      justifyContent: "center",
    },
    /** Soft accent disc behind every icon — bumped slightly so it keeps up
     *  with bolder inactive strokes without competing with the active pill. */
    idleWell: {
      position: "absolute",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: T.accentTint,
      opacity: 0.55,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.accentLine,
    },
    idleWellHidden: {
      opacity: 0,
    },
    activeWell: {
      position: "absolute",
      width: 48,
      height: 40,
      borderRadius: T.radius.pill,
      backgroundColor: T.accentTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.accentLine,
    },
  });
}
