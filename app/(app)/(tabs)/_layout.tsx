import React, { useEffect, useMemo, useRef } from "react";
import { Tabs } from "expo-router";
import {
  Animated,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Dumbbell, UtensilsCrossed, LineChart, User } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/src/context/ThemeContext";
import type { AppTheme } from "@/src/theme";
import { bottomInset } from "@/src/lib/safe-area";
import {
  TAB_PILL_BOTTOM_GAP,
  TAB_PILL_H,
  TAB_PILL_H_MARGIN,
  tabChromeDockHeight,
} from "@/src/lib/tab-chrome";

const INACTIVE_ICON_ALPHA = 0.78;

function whiteAtAlpha(alpha: number): string {
  return `rgba(255,255,255,${alpha})`;
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
          color={focused ? "#FFFFFF" : whiteAtAlpha(INACTIVE_ICON_ALPHA)}
          strokeWidth={focused ? 2.2 : 2.6}
        />
      </Animated.View>
    </Pressable>
  );
}

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme: T } = useTheme();
  const s = useMemo(() => makeStyles(T), [T]);
  const safeBottom = bottomInset(insets.bottom);
  const pillBottom = safeBottom + TAB_PILL_BOTTOM_GAP;
  const dockH = tabChromeDockHeight(insets.bottom);

  useEffect(() => {
    const accent = T.accent;
    const restore = T.bg;
    void import("expo-system-ui")
      .then((SystemUI) => SystemUI.setBackgroundColorAsync(accent))
      .catch(() => undefined);
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(accent, true);
    }
    return () => {
      void import("expo-system-ui")
        .then((SystemUI) => SystemUI.setBackgroundColorAsync(restore))
        .catch(() => undefined);
    };
  }, [T.accent, T.bg]);

  return (
    <View style={s.overlayRoot} pointerEvents="box-none">
      {/* Solid brand-red dock behind / around / below the pill */}
      <View
        pointerEvents="none"
        style={[
          s.redDock,
          {
            height: dockH,
            backgroundColor: T.accent,
          },
        ]}
      />

      <View
        style={[
          s.pillWrap,
          {
            bottom: pillBottom,
            left: TAB_PILL_H_MARGIN,
            right: TAB_PILL_H_MARGIN,
            height: TAB_PILL_H,
          },
        ]}
      >
        <View style={[s.pillClip, { backgroundColor: T.accentPressed }]}>
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
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
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
    redDock: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      // Slight top radius so the red chrome meets page content cleanly.
      borderTopLeftRadius: T.radius.xl,
      borderTopRightRadius: T.radius.xl,
    },
    pillWrap: {
      position: "absolute",
      backgroundColor: "transparent",
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 14,
      elevation: 10,
    },
    pillClip: {
      flex: 1,
      borderRadius: T.radius.pill,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "rgba(255,255,255,0.28)",
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
      height: TAB_PILL_H - 12,
      alignItems: "center",
      justifyContent: "center",
    },
    idleWell: {
      position: "absolute",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: whiteAtAlpha(0.14),
      opacity: 1,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: whiteAtAlpha(0.22),
    },
    idleWellHidden: {
      opacity: 0,
    },
    activeWell: {
      position: "absolute",
      width: 48,
      height: 40,
      borderRadius: T.radius.pill,
      backgroundColor: whiteAtAlpha(0.22),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: whiteAtAlpha(0.4),
    },
  });
}
