import { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Award,
  Dumbbell,
  Scale,
  UtensilsCrossed,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

export const PROGRESS_TABS = ["Body", "Training", "Nutrition", "Records"] as const;
export type ProgressTab = (typeof PROGRESS_TABS)[number];

const TAB_ICON = {
  Body: Scale,
  Training: Dumbbell,
  Nutrition: UtensilsCrossed,
  Records: Award,
} as const;

type Props = {
  active: ProgressTab;
  onChange: (tab: ProgressTab) => void;
};

export function ProgressSegmentBar({ active, onChange }: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const [width, setWidth] = useState(0);
  const indexAnim = useRef(
    new Animated.Value(PROGRESS_TABS.indexOf(active)),
  ).current;

  useEffect(() => {
    Animated.spring(indexAnim, {
      toValue: PROGRESS_TABS.indexOf(active),
      useNativeDriver: true,
      friction: 8,
      tension: 140,
    }).start();
  }, [active, indexAnim]);

  const slotW = width / PROGRESS_TABS.length;
  const inset = 4;
  const indicatorW = Math.max(0, slotW - inset * 2);
  const lastIndex = PROGRESS_TABS.length - 1;

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={s.track} onLayout={onLayout}>
      {width > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            s.indicator,
            {
              width: indicatorW,
              transform: [
                {
                  translateX: indexAnim.interpolate({
                    inputRange: [0, lastIndex],
                    outputRange: [inset, lastIndex * slotW + inset],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}

      {PROGRESS_TABS.map((tab) => {
        const focused = tab === active;
        const Icon = TAB_ICON[tab];
        return (
          <Pressable
            key={tab}
            onPress={() => {
              if (tab === active) return;
              void Haptics.selectionAsync();
              onChange(tab);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            style={s.slot}
          >
            <Icon
              size={15}
              color={focused ? T.onAccent : T.muted}
              strokeWidth={focused ? 2.4 : 1.9}
            />
            <Text
              style={[s.label, focused && s.labelActive]}
              numberOfLines={1}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    track: {
      flexDirection: "row",
      alignItems: "center",
      height: 48,
      borderRadius: T.radius.pill,
      backgroundColor: T.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
      overflow: "hidden",
    },
    indicator: {
      position: "absolute",
      top: 4,
      bottom: 4,
      borderRadius: T.radius.pill,
      backgroundColor: T.accent,
    },
    slot: {
      flex: 1,
      height: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      zIndex: 1,
    },
    label: {
      fontFamily: T.bodySemi,
      fontSize: 11,
      color: T.muted,
    },
    labelActive: {
      fontFamily: T.bodyBold,
      color: T.onAccent,
    },
  });
}
