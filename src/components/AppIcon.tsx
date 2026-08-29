import {
  Image,
  StyleSheet,
  View,
  type ColorValue,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { AppIcons, type AppIconName } from "@/src/lib/app-icons";

type Props = {
  name: AppIconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
  /** Dim unfocused tab icons without recoloring the art. */
  opacity?: number;
  /**
   * Forces a single UI color (nav bar). Full-color art is kept when omitted
   * (macros, checklist, water, etc.).
   */
  tintColor?: ColorValue;
};

/**
 * Glossy PNG icons. In light mode we keep full opacity and add a tiny
 * shadow so red/white art (drawn for dark canvases) doesn’t look washed out.
 */
export function AppIcon({
  name,
  size = 24,
  style,
  opacity = 1,
  tintColor,
}: Props) {
  const { resolved } = useTheme();
  const isLight = resolved === "light";

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        isLight && styles.lightLift,
      ]}
    >
      <Image
        source={AppIcons[name]}
        style={[
          {
            width: size,
            height: size,
            // Never soften below this in light mode — pale bg already eats contrast.
            opacity: isLight ? Math.max(opacity, 0.92) : opacity,
          },
          tintColor ? { tintColor } : null,
          style,
        ]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lightLift: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 2.5,
    elevation: 2,
  },
});
