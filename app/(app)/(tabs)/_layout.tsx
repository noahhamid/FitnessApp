import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tabs } from "expo-router";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Dumbbell,
  Home,
  LineChart,
  User,
  UtensilsCrossed,
} from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/context/ThemeContext";
import type { AppTheme } from "@/src/theme";
import { bottomInset } from "@/src/lib/safe-area";
import {
  TAB_PILL_BOTTOM_GAP,
  TAB_PILL_H,
  TAB_PILL_H_MARGIN,
} from "@/src/lib/tab-chrome";

type TabIcon = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}>;

const TAB_META: Record<
  string,
  { label: string; icon: TabIcon; fillOnFocus?: boolean }
> = {
  index: { label: "Home", icon: Home },
  train: { label: "Train", icon: Dumbbell },
  nutrition: { label: "Nutrition", icon: UtensilsCrossed },
  // LineChart's fill paints the whole plot area as a red blob — stroke only.
  progress: { label: "Progress", icon: LineChart, fillOnFocus: false },
  profile: { label: "Profile", icon: User },
};

function TabSlot({
  focused,
  label,
  icon: Icon,
  fillOnFocus = true,
  onPress,
  onLongPress,
  color,
  muted,
}: {
  focused: boolean;
  label: string;
  icon: TabIcon;
  fillOnFocus?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  color: string;
  muted: string;
}) {
  const focus = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(focus, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 180,
    }).start();
  }, [focused, focus]);

  const iconScale = focus.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const iconLift = focus.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        Animated.spring(press, {
          toValue: 0.88,
          useNativeDriver: true,
          friction: 6,
          tension: 240,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(press, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 240,
        }).start();
      }}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      style={styles.slot}
    >
      <Animated.View
        style={{
          transform: [{ scale: Animated.multiply(iconScale, press) }, { translateY: iconLift }],
        }}
      >
        <Icon
          size={24}
          color={focused ? color : muted}
          strokeWidth={focused ? 2.35 : 1.9}
          fill={focused && fillOnFocus ? color : "none"}
        />
      </Animated.View>
    </Pressable>
  );
}

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme: T } = useTheme();
  const s = useMemo(() => makeBarStyles(T), [T]);
  const pillBottom = bottomInset(insets.bottom) + TAB_PILL_BOTTOM_GAP;
  const [rowW, setRowW] = useState(0);
  const indexAnim = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(indexAnim, {
      toValue: state.index,
      useNativeDriver: true,
      friction: 8,
      tension: 160,
    }).start();
  }, [state.index, indexAnim]);

  const count = Math.max(state.routes.length, 1);
  const slotW = rowW / count;
  const indicatorW = 44;

  return (
    <View style={s.overlayRoot} pointerEvents="box-none">
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
        <View style={s.pill}>
          {rowW > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                s.indicator,
                {
                  width: indicatorW,
                  transform: [
                    {
                      translateX: indexAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          (slotW - indicatorW) / 2,
                          slotW + (slotW - indicatorW) / 2,
                        ],
                      }),
                    },
                  ],
                },
              ]}
            />
          ) : null}
          <View
            style={s.row}
            onLayout={(e) => setRowW(e.nativeEvent.layout.width)}
          >
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

              return (
                <TabSlot
                  key={route.key}
                  focused={focused}
                  label={meta.label}
                  icon={meta.icon}
                  fillOnFocus={meta.fillOnFocus !== false}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  color={T.accent}
                  muted={T.muted}
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

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    height: TAB_PILL_H - 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

function makeBarStyles(T: AppTheme) {
  return StyleSheet.create({
    overlayRoot: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "transparent",
    },
    pillWrap: {
      position: "absolute",
      backgroundColor: "transparent",
    },
    pill: {
      flex: 1,
      borderRadius: T.radius.pill,
      overflow: "hidden",
      backgroundColor: T.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
      ...T.shadow.lifted,
    },
    indicator: {
      position: "absolute",
      top: (TAB_PILL_H - 40) / 2,
      height: 40,
      borderRadius: 20,
      backgroundColor: T.accentTint,
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      zIndex: 1,
    },
  });
}
