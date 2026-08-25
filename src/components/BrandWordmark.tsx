import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";
import { FONTS } from "@/src/ui/tokens";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

type Props = {
  size?: number;
  style?: StyleProp<TextStyle>;
};

/** Welcome-style mark: italic Potential (ink) + Peak (red). */
export function BrandWordmark({ size = 22, style }: Props) {
  const { styles: s } = useThemedStyles(makeStyles);
  const lineHeight = Math.round(size * 1.05);

  return (
    <Text
      style={[s.base, { fontSize: size, lineHeight }, style]}
      numberOfLines={1}
      accessibilityRole="header"
      accessibilityLabel="PotentialPeak"
    >
      Potential
      <Text style={[s.peak, { fontSize: size, lineHeight }]}>Peak</Text>
    </Text>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    base: {
      fontFamily: FONTS.blackItalic,
      color: T.white,
      letterSpacing: -0.6,
    },
    peak: {
      fontFamily: FONTS.blackItalic,
      color: T.accent,
    },
  });
}
