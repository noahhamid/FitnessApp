import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useOptionalTheme } from "@/src/context/ThemeContext";
import { lightTheme, type AppTheme } from "@/src/theme";

/** Quarter-circle catch-light tucked into the top-left corner. */
const CORNER_ARC_SIZE = 100;
const CORNER_ARC_PATH = "M8,62 A54,54 0 0,1 62,8";
const CORNER_ARC_STROKE_DARK = "rgba(255,255,255,0.35)";
/** Matches GLASS_TOP_BORDER_LIGHT for one consistent light-catch language. */
const CORNER_ARC_STROKE_LIGHT = "rgba(255,255,255,1)";
const CORNER_ARC_STROKE_WIDTH = 1.5;

/** Shared faux-glass tokens — TodaySnapshotRow / ProgressCoachCard
 * stay on one intensity. */
export const GLASS_GRADIENT_DARK = [
  "rgba(255,255,255,0.16)",
  "rgba(255,255,255,0.02)",
  "rgba(255,255,255,0.09)",
] as const;

/** Light: ~1.75× prior wash — full 2× muddies white-on-paper. */
export const GLASS_GRADIENT_LIGHT = [
  "rgba(229,57,53,0.07)",
  "rgba(229,57,53,0)",
  "rgba(10,10,10,0.055)",
] as const;

export const GLASS_TOP_BORDER_DARK = "rgba(255,255,255,0.32)";
export const GLASS_TOP_BORDER_LIGHT = "rgba(255,255,255,1)";
export const GLASS_TOP_HIGHLIGHT_DARK = "rgba(255,255,255,0.22)";
export const GLASS_TOP_HIGHLIGHT_LIGHT = "rgba(255,255,255,1)";
export const GLASS_BORDER_TOP_WIDTH = 1.5;

/** Lifted shadow so glass panels sit off the dashboard plane. */
export function glassCardShadow(T: AppTheme) {
  return {
    ...T.shadow.lifted,
    shadowRadius: 16,
    shadowOpacity: 0.14,
    elevation: 5,
  };
}

type Props = {
  children: ReactNode;
  /** Layout chrome (radius, flex, padding, gap, align). Border/shadow/fill applied here. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Solid elevated base + diagonal highlight gradient + brighter/thicker top
 * edge + thin corner arc + inset catch-light. Not real blur.
 */
export function GlassSurface({ children, style }: Props) {
  const ctx = useOptionalTheme();
  const T = ctx?.theme ?? lightTheme;
  const resolved = ctx?.resolved ?? "light";
  const isDark = resolved === "dark";
  const gradient = isDark ? GLASS_GRADIENT_DARK : GLASS_GRADIENT_LIGHT;
  const topEdge = isDark ? GLASS_TOP_BORDER_DARK : GLASS_TOP_BORDER_LIGHT;
  const highlight = isDark
    ? GLASS_TOP_HIGHLIGHT_DARK
    : GLASS_TOP_HIGHLIGHT_LIGHT;
  const arcStroke = isDark ? CORNER_ARC_STROKE_DARK : CORNER_ARC_STROKE_LIGHT;

  return (
    <View
      style={[
        glassCardShadow(T),
        {
          backgroundColor: T.bgElevated,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: T.glassBorder,
          borderTopColor: topEdge,
          borderTopWidth: GLASS_BORDER_TOP_WIDTH,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Svg
        pointerEvents="none"
        width={CORNER_ARC_SIZE}
        height={CORNER_ARC_SIZE}
        style={styles.cornerArc}
      >
        <Path
          d={CORNER_ARC_PATH}
          stroke={arcStroke}
          strokeWidth={CORNER_ARC_STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <View
        pointerEvents="none"
        style={[styles.topHighlight, { backgroundColor: highlight }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cornerArc: {
    position: "absolute",
    top: -18,
    left: -18,
  },
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: StyleSheet.hairlineWidth * 2,
  },
});

