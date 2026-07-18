import React, { useEffect, useRef, useState } from "react";
import { Tabs } from "expo-router";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

// ─── Theme tokens ────────────────────────────────────────────────────────────
// Same values as the rest of the app (Meal / Dashboard / Workout).
const T = {
  bg: "#111318",
  glass: "rgba(255,255,255,0.10)",
  glassBorder: "rgba(255,255,255,0.16)",
  accent: "#FFC700",
  muted: "rgba(255,255,255,0.4)",
  bodySemi: "Inter_600SemiBold",
};

const CENTER_INDEX = 2; // Nutrition sits in the middle of the 5 routes

// ─── Icons ────────────────────────────────────────────────────────────────────
// Same custom SVGs as before, just recolored to the shared tokens.

function IconHome({ active }: { active: boolean }) {
  const c = active ? T.accent : T.muted;
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V10.5z"
        stroke={c}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function IconTrain({ active }: { active: boolean }) {
  const c = active ? T.accent : T.muted;
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Line
        x1="5.5"
        y1="12"
        x2="18.5"
        y2="12"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Rect
        x="2"
        y="9.5"
        width="3.5"
        height="5"
        rx="1"
        stroke={c}
        strokeWidth={1.6}
      />
      <Rect
        x="18.5"
        y="9.5"
        width="3.5"
        height="5"
        rx="1"
        stroke={c}
        strokeWidth={1.6}
      />
      <Rect
        x="5.5"
        y="8"
        width="3"
        height="8"
        rx="1.5"
        stroke={c}
        strokeWidth={1.6}
      />
      <Rect
        x="15.5"
        y="8"
        width="3"
        height="8"
        rx="1.5"
        stroke={c}
        strokeWidth={1.6}
      />
    </Svg>
  );
}

function IconNutrition({ active }: { active: boolean }) {
  const c = active ? T.bg : T.muted;
  const w = 1.6;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 12.5C17 16.5 14.5 20 12 21C9.5 20 7 16.5 7 12.5C7 9 9 7 12 7C15 7 17 9 17 12.5Z"
        stroke={c}
        strokeWidth={w}
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 7C9.5 7 8 5.5 9 4"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
      />
      <Path
        d="M14.5 7C14.5 7 16 5.5 15 4"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
      />
      <Line
        x1="12"
        y1="7"
        x2="12"
        y2="5"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function IconProgress({ active }: { active: boolean }) {
  const c = active ? T.accent : T.muted;
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="3,18 8,12 13,15 21,5"
        stroke={c}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="21" cy="5" r={2} fill={c} />
    </Svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const c = active ? T.accent : T.muted;
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth={1.6} />
      <Path
        d="M4 20c0-3.5 3.6-6.5 8-6.5s8 3 8 6.5"
        stroke={c}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  index: (a) => <IconHome active={a} />,
  train: (a) => <IconTrain active={a} />,
  nutrition: (a) => <IconNutrition active={a} />,
  progress: (a) => <IconProgress active={a} />,
  profile: (a) => <IconProfile active={a} />,
};

const LABELS: Record<string, string> = {
  index: "Home",
  train: "Train",
  nutrition: "Nutrition",
  progress: "Progress",
  profile: "Profile",
};

// ─── Center FAB — springs up/pops gold when it becomes active ──────────────

function CenterFab({ focused }: { focused: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.12,
        useNativeDriver: true,
        speed: 22,
        bounciness: 9,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 16,
        bounciness: 8,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={s.centerOuter}>
      <Animated.View
        style={[
          s.centerFab,
          focused && s.centerFabActive,
          { transform: [{ scale }] },
        ]}
      >
        <IconNutrition active={focused} />
      </Animated.View>
      <Text style={[s.label, focused && s.labelActive]}>Nutrition</Text>
    </View>
  );
}

// ─── Custom tab bar ──────────────────────────────────────────────────────────

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12) + 8; // floats clear of the home indicator

  const [rowWidth, setRowWidth] = useState(0);
  const itemCount = state.routes.length;
  const itemWidth = rowWidth > 0 ? rowWidth / itemCount : 0;

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorOpacity = useRef(new Animated.Value(0)).current;
  const INSET = 6;

  useEffect(() => {
    if (itemWidth === 0) return;
    Animated.spring(indicatorX, {
      toValue: state.index * itemWidth + INSET,
      useNativeDriver: true,
      speed: 16,
      bounciness: 7,
    }).start();
    Animated.timing(indicatorOpacity, {
      toValue: state.index === CENTER_INDEX ? 0 : 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [state.index, itemWidth]);

  const handleLayout = (e: LayoutChangeEvent) =>
    setRowWidth(e.nativeEvent.layout.width);

  return (
    <View style={[s.wrap, { bottom: bottomOffset }]}>
      <View style={s.bar}>
        <BlurView
          intensity={40}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <View style={s.tint} pointerEvents="none" />

        <View style={s.row} onLayout={handleLayout}>
          {rowWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                s.indicator,
                {
                  width: itemWidth - INSET * 2,
                  opacity: indicatorOpacity,
                  transform: [{ translateX: indicatorX }],
                },
              ]}
            />
          )}

          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const isCenter = index === CENTER_INDEX;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            if (isCenter) {
              return (
                <Pressable key={route.key} onPress={onPress} style={s.slot}>
                  <CenterFab focused={focused} />
                </Pressable>
              );
            }

            return (
              <Pressable key={route.key} onPress={onPress} style={s.slot}>
                <View style={s.tab}>
                  {ICONS[route.name]?.(focused)}
                  <Text style={[s.label, focused && s.labelActive]}>
                    {LABELS[route.name] ?? route.name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function AppTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="train" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  bar: {
    height: 68,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.glassBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  // Sits over the BlurView so the frosted effect reads as "dark glass"
  // consistent with every other card in the app, rather than iOS's default
  // light frost.
  tint: { ...StyleSheet.absoluteFillObject, backgroundColor: T.glass },

  row: { flex: 1, flexDirection: "row", position: "relative" },
  slot: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Sliding highlight behind the focused flat tab — same transparent-fill,
  // gold-border pill used by DashboardCalendar's selected day.
  indicator: {
    position: "absolute",
    top: 8,
    height: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: T.accent,
    backgroundColor: "transparent",
  },

  tab: { alignItems: "center", gap: 4 },
  label: {
    fontFamily: T.bodySemi,
    fontSize: 9.5,
    color: T.muted,
    letterSpacing: 0.1,
  },
  labelActive: { color: T.accent },

  centerOuter: { alignItems: "center", gap: 4, marginTop: -22 },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  centerFabActive: {
    backgroundColor: T.accent,
    borderColor: T.accent,
    shadowColor: T.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
});
