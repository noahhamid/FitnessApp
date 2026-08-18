import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { Image as ExpoImage, type ImageContentPosition } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
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
  /** Idle = label on a quiet card; the photo fades in when selected. */
  revealImageOnSelect?: boolean;
};

/** Map offset → expo-image contentPosition without scaling the photo. */
function bgContentPosition(offsetY: number): ImageContentPosition {
  if (!offsetY) return "center";
  const y = Math.max(0, Math.min(100, 50 - offsetY));
  return { top: `${y}%`, left: "50%" };
}

const CARD_TOP_WEIGHT = 30;
const CARD_WEIGHT = 70;
const CUTOUT_WEIGHT = 74;
const CUTOUT_TAIL_WEIGHT = 26;

const CARD_COLOR_SELECTED = "#E53935";

function fadeStops(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
  return [rgba(0), rgba(0.25), rgba(0.7), rgba(1), rgba(1)] as const;
}

const FADE_LOCATIONS = [0, 0.35, 0.68, 0.88, 1] as const;
const FADE_SELECTED = fadeStops(CARD_COLOR_SELECTED);

function scrimFromBg(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [
    `rgba(${r},${g},${b},0.38)`,
    `rgba(${r},${g},${b},0.22)`,
    `rgba(${r},${g},${b},0.45)`,
  ] as const;
}

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
  revealImageOnSelect = false,
}: Props) {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);
  const inside = imagePlacement === "inside";
  const background = imagePlacement === "background";
  const hasDesc = Boolean(desc);
  const mediaWeight = hasDesc ? CUTOUT_WEIGHT : 82;
  const bodyWeight = hasDesc ? CUTOUT_TAIL_WEIGHT : 18;
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  const fadeDefault = useMemo(() => fadeStops(C.bg3), [C.bg3]);
  const bgScrim = useMemo(() => scrimFromBg(C.bg), [C.bg]);
  const showBgShade = resolved === "dark";

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isSelected ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  }, [isSelected, anim]);

  const cardScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, background ? 1.03 : 1.06],
  });

  const cardColor = isSelected ? CARD_COLOR_SELECTED : C.bg3;

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
      colors={isSelected ? FADE_SELECTED : fadeDefault}
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
              backgroundColor: revealImageOnSelect ? CARD_COLOR_SELECTED : C.bg,
              transform: [{ scale: cardScale }],
              borderColor: revealImageOnSelect
                ? CARD_COLOR_SELECTED
                : isSelected
                  ? C.accent
                  : C.border,
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[s.bgReveal, revealImageOnSelect && { opacity: anim }]}
          >
            <ExpoImage
              source={image}
              contentFit={imageFit === "contain" ? "contain" : "cover"}
              contentPosition={bgContentPosition(imageOffsetY)}
              style={[s.bgImage, flipX && s.cutoutFlipped]}
            />
            {showBgShade ? (
              <LinearGradient
                colors={[...bgScrim]}
                locations={[0, 0.45, 1]}
                style={s.bgShade}
              />
            ) : null}
            {revealImageOnSelect ? (
              <LinearGradient
                colors={FADE_SELECTED}
                locations={FADE_LOCATIONS}
                style={s.insideFade}
              />
            ) : null}
          </Animated.View>
          <View style={s.bgLabelWrap} pointerEvents="none">
            <Text
              style={[
                s.bgTitle,
                s.bgTitleSelected,
              ]}
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
        <Animated.View
          style={[
            s.insideCard,
            { backgroundColor: cardColor, transform: [{ scale: cardScale }] },
          ]}
        >
          <ExpoImage
            source={image}
            contentFit={imageFit === "contain" ? "contain" : "cover"}
            contentPosition={
              imageOffsetY
                ? bgContentPosition(imageOffsetY)
                : { top: "0%", left: "50%" }
            }
            style={[s.insideFill, flipX && s.cutoutFlipped]}
          />
          <LinearGradient
            colors={isSelected ? FADE_SELECTED : fadeDefault}
            locations={FADE_LOCATIONS}
            style={s.insideFade}
          />
          <View style={s.insideBody} pointerEvents="none">
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

function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
    slot: {
      padding: 8,
    },
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
      height: "48%",
      zIndex: 2,
    },
    insideFade: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "70%",
      zIndex: 2,
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
    insideFill: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
    insideBody: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "flex-end",
      paddingHorizontal: 12,
      paddingTop: 4,
      paddingBottom: 12,
      zIndex: 3,
    },
    bgCard: {
      flex: 1,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: C.border,
      backgroundColor: C.bg3,
      justifyContent: "center",
      alignItems: "center",
    },
    bgReveal: {
      ...StyleSheet.absoluteFillObject,
    },
    bgImage: {
      position: "absolute",
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
    },
    bgTitleSelected: {
      color: "#FFFFFF",
      textShadowColor: "rgba(0,0,0,0.65)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
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
      color: C.muted,
    },
    descSelected: {
      color: "rgba(255, 255, 255, 0.9)",
    },
  });
}
