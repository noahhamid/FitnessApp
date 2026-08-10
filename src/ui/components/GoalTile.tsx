import { C, FONTS } from "@/src/ui/tokens";
import { Image as ExpoImage, type ImageContentPosition } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = {
  image: ImageSourcePropType;
  title: string;
  desc?: string;
  isSelected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  /** Mirror the cutout horizontally (across the Y axis). */
  flipX?: boolean;
  /** "checkbox" for multi-select grids, e.g. focus areas. */
  role?: "radio" | "checkbox";
  /**
   * "breakout" lets the subject rise above the card's top edge (gender, goals).
   * "inside" keeps it clipped within the card (chip screens).
   * "background" is a full-bleed photo behind a heavy shade + centered label
   * (focus areas) — not a cutout chip.
   */
  imagePlacement?: "breakout" | "inside" | "background";
  /** "cover" crops to fill the media area, i.e. zooms in. Inside/background. */
  imageFit?: "contain" | "cover";
  /**
   * Vertical crop bias for background tiles (object-position).
   * Positive favors the top of the photo (subject sits lower);
   * negative favors the bottom (subject lifts).
   */
  imageOffsetY?: number;
};

/** Map offset → expo-image contentPosition without scaling the photo. */
function bgContentPosition(offsetY: number): ImageContentPosition {
  if (!offsetY) return "center";
  const y = Math.max(0, Math.min(100, 50 - offsetY));
  return { top: `${y}%`, left: "50%" };
}

// Vertical proportions, expressed as flex weights so everything scales with the
// card instead of relying on percentage heights (which resolve to 0 for
// absolutely positioned children of a flex parent).
const CARD_TOP_WEIGHT = 30; // empty space above the card surface
const CARD_WEIGHT = 70; // the card surface itself
const CUTOUT_WEIGHT = 74; // cutout spans this much from the top...
const CUTOUT_TAIL_WEIGHT = 26; // ...leaving this for the text below

const CARD_COLOR = C.bg3;
const CARD_COLOR_SELECTED = "#E53935";

/**
 * Ramp from fully transparent to the solid card colour. Using rgba(colour, 0)
 * rather than "transparent" matters: "transparent" is rgba(0, 0, 0, 0), so the
 * ramp blends black through its middle and the seam stays visible.
 */
function fadeStops(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
  return [rgba(0), rgba(0.25), rgba(0.7), rgba(1), rgba(1)] as const;
}

// Fully opaque before the image's bottom edge, so there is no line to spot.
const FADE_LOCATIONS = [0, 0.35, 0.68, 0.88, 1] as const;
const FADE_DEFAULT = fadeStops(CARD_COLOR);
const FADE_SELECTED = fadeStops(CARD_COLOR_SELECTED);

export function GoalTile({
  image,
  title,
  desc,
  isSelected,
  onPress,
  style,
  flipX = false,
  role = "radio",
  imagePlacement = "breakout",
  imageFit = "contain",
  imageOffsetY = 0,
}: Props) {
  const inside = imagePlacement === "inside";
  const background = imagePlacement === "background";
  const hasDesc = Boolean(desc);
  // Without a subtitle the label band still needs room for 2-line titles.
  const mediaWeight = hasDesc ? CUTOUT_WEIGHT : 82;
  const bodyWeight = hasDesc ? CUTOUT_TAIL_WEIGHT : 18;
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isSelected ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  }, [isSelected, anim]);

  // Selecting lifts the whole card, cutout included, like a hover state.
  const cardScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, background ? 1.03 : 1.06],
  });

  const cardColor = isSelected ? CARD_COLOR_SELECTED : CARD_COLOR;

  const label = (
    <>
      <Text
        style={[s.title, !hasDesc && s.titleSolo, isSelected && s.titleSelected]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        allowFontScaling={false}
      >
        {title}
      </Text>
      {hasDesc ? (
        <Text
          style={[s.desc, isSelected && s.descSelected]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          allowFontScaling={false}
        >
          {desc}
        </Text>
      ) : null}
    </>
  );

  const fade = (
    <LinearGradient
      colors={isSelected ? FADE_SELECTED : FADE_DEFAULT}
      locations={FADE_LOCATIONS}
      style={s.cutoutFade}
    />
  );

  return (
    <Pressable
      style={({ pressed }) => [
        background ? s.slotBg : s.slot,
        style,
        pressed && s.slotPressed,
      ]}
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={{ selected: isSelected, checked: isSelected }}
      accessibilityLabel={desc ? `${title}. ${desc}` : title}
    >
      {background ? (
        <Animated.View
          style={[
            s.bgCard,
            {
              transform: [{ scale: cardScale }],
              borderColor: isSelected ? C.accent : C.border,
            },
          ]}
        >
          {/*
            Bleed past the clip (-2) so rounded anti-alias doesn't leave a
            hairline. Reframe with contentPosition — not scale/translate —
            so cover stays natural zoom.
          */}
          <ExpoImage
            source={image}
            contentFit={imageFit === "contain" ? "contain" : "cover"}
            contentPosition={bgContentPosition(imageOffsetY)}
            style={[s.bgImage, flipX && s.cutoutFlipped]}
          />
          <LinearGradient
            pointerEvents="none"
            colors={[
              "rgba(17,19,24,0.38)",
              "rgba(17,19,24,0.22)",
              "rgba(17,19,24,0.45)",
            ]}
            locations={[0, 0.45, 1]}
            style={s.bgShade}
          />
          <View style={s.bgLabelWrap} pointerEvents="none">
            <Text
              style={[s.bgTitle, isSelected && s.bgTitleSelected]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              allowFontScaling={false}
            >
              {title}
            </Text>
          </View>
        </Animated.View>
      ) : inside ? (
        // One clipped card, stacked top to bottom: overlaying an absolute
        // rounded layer on the card leaves a hairline of the layer's own
        // background along the border.
        <Animated.View
          style={[
            s.insideCard,
            { backgroundColor: cardColor, transform: [{ scale: cardScale }] },
          ]}
        >
          <View style={[s.insideMedia, { flex: mediaWeight }]} pointerEvents="none">
            <Image
              source={image}
              resizeMode={imageFit}
              style={[s.cutout, flipX && s.cutoutFlipped]}
            />
            {fade}
          </View>
          <View
            style={[s.insideBody, { flex: bodyWeight }]}
            pointerEvents="none"
          >
            {label}
          </View>
        </Animated.View>
      ) : (
        <Animated.View style={[s.inner, { transform: [{ scale: cardScale }] }]}>
          <View style={s.bgLayer} pointerEvents="none">
            <View style={s.topSpacer} />
            <View style={[s.cardBg, { backgroundColor: cardColor }]} />
          </View>

          <View style={s.cutoutLayer} pointerEvents="none">
            <View style={[s.cutoutWrap, { flex: mediaWeight }]}>
              <Image
                source={image}
                resizeMode="contain"
                style={[s.cutout, flipX && s.cutoutFlipped]}
              />
              {/* Dissolves the image into the card surface. */}
              {fade}
            </View>
            <View style={[s.cutoutTail, { flex: bodyWeight }]} />
          </View>

          <View style={s.body} pointerEvents="none">
            {label}
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  slot: {
    padding: 8,
  },
  // Tighter gutters so focus / injury labels get more horizontal room.
  slotBg: {
    padding: 5,
  },
  slotPressed: {
    opacity: 0.94,
  },
  inner: {
    flex: 1,
    position: "relative",
  },

  topSpacer: {
    flex: CARD_TOP_WEIGHT,
  },

  // Card surface occupies the lower portion, so the cutout above it reads as
  // breaking out over the card's top edge.
  bgLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  cardBg: {
    flex: CARD_WEIGHT,
    borderRadius: 20,
  },

  cutoutLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  cutoutWrap: {
    position: "relative",
  },
  cutout: {
    width: "100%",
    height: "100%",
  },
  cutoutFlipped: {
    transform: [{ scaleX: -1 }],
  },
  cutoutFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "62%",
  },
  cutoutTail: {},

  body: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 3,
  },

  insideCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  // Artwork fills most of the card; flex weight is set inline from hasDesc.
  insideMedia: {
    backgroundColor: "#000000",
    position: "relative",
  },
  insideBody: {
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },

  // Full-bleed photo as button atmosphere (focus areas).
  bgCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: C.border,
    // Match screen bg, not pure black — pure #000 reads as a bright hairline
    // against the anti-aliased rounded photo edge on many Android GPUs.
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  bgImage: {
    position: "absolute",
    // Bleed past the clip so rounded anti-alias doesn't leave a 1px gap.
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
  },
  bgShade: {
    ...StyleSheet.absoluteFillObject,
  },
  bgLabelWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "stretch",
    paddingHorizontal: 4,
    zIndex: 2,
  },
  bgTitle: {
    fontFamily: FONTS.blackItalic,
    fontSize: 16,
    lineHeight: 18,
    letterSpacing: 0.2,
    textTransform: "uppercase",
    textAlign: "center",
    width: "100%",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  bgTitleSelected: {
    color: "#FFFFFF",
  },

  // Same punch as ChipSelect (goal-detail) labels: black italic, red idle.
  title: {
    fontFamily: FONTS.blackItalic,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 2,
    color: C.accent,
  },
  titleSolo: {
    marginBottom: 0,
  },
  titleSelected: {
    color: "#FFFFFF",
  },
  desc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255, 255, 255, 0.65)",
  },
  // 65% white is too dim to read once the surface turns accent red.
  descSelected: {
    color: "rgba(255, 255, 255, 0.9)",
  },
});
