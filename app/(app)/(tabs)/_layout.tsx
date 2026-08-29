import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tabs } from "expo-router";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/context/ThemeContext";
import type { AppTheme } from "@/src/theme";
import {
  TAB_BAR_H,
  TAB_FAB_SIZE,
  TAB_PILL_H_MARGIN,
} from "@/src/lib/tab-chrome";
import { AppIcon } from "@/src/components/AppIcon";
import type { AppIconName } from "@/src/lib/app-icons";

const TAB_META: Record<string, { label: string; icon: AppIconName }> = {
  index: { label: "Home", icon: "home" },
  train: { label: "Train", icon: "train" },
  // Center FAB = meals bowl (scan lives on the Scan food button).
  nutrition: { label: "Meals", icon: "meals" },
  progress: { label: "Progress", icon: "progress" },
  profile: { label: "You", icon: "profile" },
};

const CENTER_INDEX = 2;
const NOTCH_R = 34;

/** Pill path with a soft concave notch at the top center for the FAB. */
function barPath(width: number, height: number, notchR: number): string {
  const cx = width / 2;
  const r = notchR;
  const corner = height / 2;
  const shoulder = 10;

  return [
    `M0,${corner}`,
    `Q0,0 ${corner},0`,
    `L${cx - r - shoulder},0`,
    `C${cx - r - shoulder * 0.25},0 ${cx - r},${r * 0.35} ${cx - r * 0.55},${r * 0.85}`,
    `C${cx - r * 0.2},${r * 1.15} ${cx + r * 0.2},${r * 1.15} ${cx + r * 0.55},${r * 0.85}`,
    `C${cx + r},${r * 0.35} ${cx + r + shoulder * 0.25},0 ${cx + r + shoulder},0`,
    `L${width - corner},0`,
    `Q${width},0 ${width},${corner}`,
    `L${width},${height - corner}`,
    `Q${width},${height} ${width - corner},${height}`,
    `L${corner},${height}`,
    `Q0,${height} 0,${height - corner}`,
    "Z",
  ].join(" ");
}

function NotchedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme: T, resolved } = useTheme();
  const s = useMemo(() => makeBarStyles(T), [T]);
  const safeBottom = Math.max(insets.bottom, 10);
  const screenW = Dimensions.get("window").width;
  const pillW = screenW - TAB_PILL_H_MARGIN * 2;

  const [slotCenters, setSlotCenters] = useState<number[]>(() =>
    state.routes.map((_, i) => ((i + 0.5) / state.routes.length) * pillW),
  );
  const dotX = useRef(new Animated.Value(slotCenters[state.index] ?? pillW / 2))
    .current;
  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const target = slotCenters[state.index] ?? pillW / 2;
    Animated.spring(dotX, {
      toValue: target,
      useNativeDriver: true,
      friction: 8,
      tension: 140,
    }).start();
  }, [state.index, slotCenters, pillW, dotX]);

  useEffect(() => {
    if (state.index !== CENTER_INDEX) return;
    fabScale.setValue(0.92);
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 160,
    }).start();
  }, [state.index, fabScale]);

  const onLayoutSlots = (index: number, x: number, width: number) => {
    setSlotCenters((prev) => {
      const next = [...prev];
      next[index] = x + width / 2;
      return next;
    });
  };

  return (
    <View style={s.root} pointerEvents="box-none">
      <View
        style={[s.dock, { paddingBottom: safeBottom }]}
        pointerEvents="box-none"
      >
        <View style={[s.pillWrap, { width: pillW, height: TAB_BAR_H }]}>
          <Svg width={pillW} height={TAB_BAR_H} style={StyleSheet.absoluteFill}>
            <Path
              d={barPath(pillW, TAB_BAR_H, NOTCH_R)}
              fill={T.bgElevated}
            />
          </Svg>

          <Animated.View
            pointerEvents="none"
            style={[
              s.dot,
              {
                backgroundColor: T.accent,
                transform: [
                  {
                    translateX: Animated.subtract(dotX, 3),
                  },
                ],
              },
            ]}
          />

          <View style={s.row}>
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              const isCenter = index === CENTER_INDEX;
              const { options } = descriptors[route.key];
              const meta = TAB_META[route.name] ?? {
                label: options.title ?? route.name,
                icon: "home" as AppIconName,
              };

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              if (isCenter) {
                return (
                  <View
                    key={route.key}
                    style={s.centerSlot}
                    onLayout={(e) =>
                      onLayoutSlots(
                        index,
                        e.nativeEvent.layout.x,
                        e.nativeEvent.layout.width,
                      )
                    }
                  >
                    <Animated.View
                      style={[
                        s.fabLift,
                        { transform: [{ scale: fabScale }] },
                      ]}
                    >
                      <Pressable
                        onPress={onPress}
                        onLongPress={onLongPress}
                        accessibilityRole="button"
                        accessibilityState={focused ? { selected: true } : {}}
                        accessibilityLabel={meta.label}
                        style={({ pressed }) => [
                          s.fab,
                          {
                            backgroundColor: T.accent,
                            opacity: pressed ? 0.9 : 1,
                          },
                        ]}
                      >
                        <AppIcon name={meta.icon} size={34} />
                      </Pressable>
                    </Animated.View>
                  </View>
                );
              }

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  onLayout={(e) =>
                    onLayoutSlots(
                      index,
                      e.nativeEvent.layout.x,
                      e.nativeEvent.layout.width,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityState={focused ? { selected: true } : {}}
                  accessibilityLabel={meta.label}
                  style={({ pressed }) => [
                    s.sideSlot,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <AppIcon
                    name={meta.icon}
                    size={30}
                    opacity={focused ? 1 : resolved === "light" ? 0.88 : 0.62}
                  />
                </Pressable>
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
      tabBar={(props) => <NotchedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        animation: "shift",
        transitionSpec: {
          animation: "timing",
          config: { duration: 280 },
        },
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

function makeBarStyles(T: AppTheme) {
  return StyleSheet.create({
    root: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
    },
    dock: {
      backgroundColor: T.bg,
      alignItems: "center",
      paddingTop: TAB_FAB_SIZE / 2 - 6,
    },
    pillWrap: {
      position: "relative",
      justifyContent: "center",
      ...T.shadow.lifted,
    },
    row: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    sideSlot: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 10,
    },
    centerSlot: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    fabLift: {
      marginTop: -(TAB_FAB_SIZE / 2) + 4,
    },
    fab: {
      width: TAB_FAB_SIZE,
      height: TAB_FAB_SIZE,
      borderRadius: TAB_FAB_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 4,
      borderColor: T.bg,
      ...T.shadow.lifted,
    },
    dot: {
      position: "absolute",
      bottom: 10,
      left: 0,
      width: 6,
      height: 6,
      borderRadius: 3,
      zIndex: 2,
    },
  });
}
