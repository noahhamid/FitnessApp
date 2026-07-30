import React, { useEffect, useRef } from "react";
import { Tabs } from "expo-router";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Dumbbell, Apple, LineChart, User } from "lucide-react-native";
import { T } from "@/src/theme";

// ─── Tab ─────────────────────────────────────────────────────────────────────
// Signature motion for the whole bar: the icon springs up slightly and the
// dot beneath it fades + scales in on focus — one Animated.Value per tab,
// fully native-driven (scale + opacity only), so it's cheap and can't
// desync from JS-thread work elsewhere on the screen.

function Tab({
  icon: Icon,
  label,
  focused,
}: {
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  label: string;
  focused: boolean;
}) {
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
    outputRange: [1, 1.12],
  });
  const iconLift = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  return (
    <View style={s.tab}>
      <Animated.View
        style={{ transform: [{ scale: iconScale }, { translateY: iconLift }] }}
      >
        <Icon
          size={22}
          color={focused ? T.accent : T.faint}
          strokeWidth={2.2}
        />
      </Animated.View>
      <Text style={[s.label, focused && s.labelActive]}>{label}</Text>
      <Animated.View
        pointerEvents="none"
        style={[s.activeDot, { opacity: anim, transform: [{ scale: anim }] }]}
      />
    </View>
  );
}

// Center FAB — the one lifted/elevated element in the whole nav, per the
// system's rule that T.shadow.lifted is reserved for a single selected
// element. Surface morphs paper→pine and the icon flips light/dark for
// contrast, both riding the same native-driven value.
function CenterTab({ focused }: { focused: boolean }) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 170,
    }).start();
  }, [focused, anim]);

  const fabScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  return (
    <View style={s.centerOuter}>
      <Animated.View
        style={[
          s.centerFab,
          focused && s.centerFabActive,
          { transform: [{ scale: fabScale }] },
        ]}
      >
        <Apple
          size={22}
          color={focused ? T.onImage : T.accent}
          strokeWidth={2.2}
        />
      </Animated.View>
      <Text style={[s.label, focused && s.labelActive]}>Nutrition</Text>
    </View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

const IS_IOS = Platform.OS === "ios";

export default function AppTabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, IS_IOS ? 16 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          s.tabBar,
          { paddingBottom: bottomPad, height: 58 + bottomPad },
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Tab icon={Home} label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          tabBarIcon: ({ focused }) => (
            <Tab icon={Dumbbell} label="Train" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          tabBarIcon: ({ focused }) => <CenterTab focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => (
            <Tab icon={LineChart} label="Progress" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Tab icon={User} label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: T.glass,
    borderTopWidth: 0.5,
    borderTopColor: T.glassBorder,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },

  tab: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    width: 60,
    height: 50,
    paddingBottom: 4,
  },
  label: {
    fontFamily: T.bodyBold,
    fontSize: 9.5,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: T.faint,
  },
  labelActive: {
    color: T.accent,
  },
  activeDot: {
    position: "absolute",
    bottom: -7,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accent,
  },

  // Center FAB
  centerOuter: {
    alignItems: "center",
    gap: 5,
    marginTop: -20,
    width: 60,
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: T.radius.lg,
    backgroundColor: T.glass,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    ...T.shadow.card,
  },
  centerFabActive: {
    backgroundColor: T.accent,
    borderColor: T.accent,
    ...T.shadow.lifted,
  },
});
