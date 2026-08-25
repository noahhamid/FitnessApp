import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import {
  HeightMeter,
  HEIGHT_METER_MARKER_OFFSET,
  HEIGHT_METER_VISIBLE,
  type HeightMeterHandle,
} from "@/src/ui/components/HeightMeter";
import { FONTS, useOnboardingColors, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
  type LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resolveAssetSize } from "@/src/lib/resolve-asset";

/** Meter extremities differ by gender (adult ranges with a little headroom). */
const HEIGHT_BY_GENDER = {
  male: { min: 90, max: 260, default: 175 },
  female: { min: 90, max: 230, default: 162 },
} as const;

/**
 * Full-body photo taller than the frame so legs stay clipped even when the
 * head is pinned to the header (max height).
 */
const FIGURE_HEIGHT_PCT = 120;
const FIGURE_HEIGHT_MULT = FIGURE_HEIGHT_PCT / 100;

/**
 * At this reading the head sits near the top so the figure fills most
 * of the viewport from the start. Same for both genders.
 */
const REFERENCE_CM = 170;
const REFERENCE_HEAD_FRAC = 0.08;

/** Keep the head well above mid-frame so the silhouette never sits too low. */
const MAX_HEAD_FRAC = 0.35;

/**
 * How far (px) to slide the figure toward the ruler.
 * The photo has black padding around the person, so margin/gap alone look like
 * they do nothing — this translate actually moves the silhouette.
 */
const FIGURE_TO_RULER_NUDGE = 40;

/** Sit the accent line a few px into the crown (assets are top-cropped). */
const HEAD_MARKER_INSET = 6;

function clampCm(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Soft bottom dissolve into the active screen background (light or dark). */
function figureFadeColors(bgHex: string) {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
  return [rgba(0), rgba(0.4), rgba(0.82), bgHex] as const;
}

/**
 * Head Y from the top of the frame. Max height → 0 (header bottom / ceiling).
 * REFERENCE_CM → REFERENCE_HEAD_FRAC of the frame. Shorter → lower.
 */
function figureSlideY(heightCm: number, frameH: number, maxCm: number) {
  if (frameH <= 0) return 0;
  const span = maxCm - REFERENCE_CM;
  const headFrac =
    span <= 0
      ? REFERENCE_HEAD_FRAC
      : (REFERENCE_HEAD_FRAC * (maxCm - heightCm)) / span;
  const clamped = Math.max(0, Math.min(MAX_HEAD_FRAC, headFrac));
  return clamped * frameH;
}

/** Top padding inside an Image when resizeMode="contain" letterboxes vertically. */
function containLetterboxTop(
  viewW: number,
  viewH: number,
  imgW: number,
  imgH: number,
) {
  if (viewW <= 0 || viewH <= 0 || imgW <= 0 || imgH <= 0) return 0;
  const scale = Math.min(viewW / imgW, viewH / imgH);
  const drawnH = imgH * scale;
  return Math.max(0, (viewH - drawnH) / 2);
}

function assetSize(source: ImageSourcePropType) {
  return resolveAssetSize(source, { width: 1024, height: 1536 });
}

/**
 * Y of the crown inside the body, matching the drawn bitmap (not the Image
 * view box). contain + FIGURE_HEIGHT_PCT letterboxes the photo vertically.
 */
function headYInBody(
  slideY: number,
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
) {
  const viewH = frameH * FIGURE_HEIGHT_MULT;
  const letterboxTop = containLetterboxTop(frameW, viewH, imgW, imgH);
  return slideY + letterboxTop + HEAD_MARKER_INSET;
}

export default function OnboardingHeightScreen() {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);

  const params = useLocalSearchParams<{ gender?: string; heightCm?: string }>();
  const gender = params.gender === "female" ? "female" : "male";
  const { min: minCm, max: maxCm, default: defaultCm } =
    HEIGHT_BY_GENDER[gender];

  const savedHeight = parseInt(String(params.heightCm ?? ""), 10);
  const hasSavedHeight = Number.isFinite(savedHeight);
  const [heightCm, setHeightCm] = useState<number>(
    hasSavedHeight ? clampCm(savedHeight, minCm, maxCm) : defaultCm,
  );
  const [chosen, setChosen] = useState(hasSavedHeight);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    String(hasSavedHeight ? clampCm(savedHeight, minCm, maxCm) : defaultCm),
  );
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });

  const meterRef = useRef<HeightMeterHandle>(null);
  const inputRef = useRef<TextInput>(null);

  const figureSource = useMemo(
    () =>
      gender === "female"
        ? require("@/assets/images/heightfemale.jpg")
        : require("@/assets/images/heightmale.jpg"),
    [gender],
  );
  const { width: imgW, height: imgH } = useMemo(
    () => assetSize(figureSource),
    [figureSource],
  );

  const slideY = figureSlideY(heightCm, frameSize.h, maxCm);
  const meterTop =
    headYInBody(slideY, frameSize.w, frameSize.h, imgW, imgH) -
    HEIGHT_METER_MARKER_OFFSET;

  const onFrameLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setFrameSize({ w: width, h: height });
  }, []);

  const commitDraft = () => {
    const parsed = parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(heightCm));
      setEditing(false);
      return;
    }
    const next = clampCm(parsed, minCm, maxCm);
    setHeightCm(next);
    setDraft(String(next));
    setChosen(true);
    setEditing(false);
    meterRef.current?.scrollToValue(next);
  };

  const startEditing = () => {
    setDraft(String(heightCm));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleHeightChange = (next: number) => {
    setHeightCm(next);
    setChosen(true);
  };

  const handleNext = () => {
    if (!chosen) return;
    router.push({
      pathname: "/(auth)/onboarding/weight",
      params: { ...params, heightCm: String(heightCm) },
    });
  };

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <OnboardingHeader
          headline={"YOUR\nHEIGHT."}
          sub="Used to calibrate load and body metrics."
          onBack={() => router.back()}
        />

        <View style={s.body} collapsable={false}>
          {/*
            Frame starts at the header's bottom edge (ceiling for the head at
            max height) and fills down to the continue button.
          */}
          <View style={s.figureFrame} onLayout={onFrameLayout}>
            <Image
              source={figureSource}
              style={[
                s.figureImage,
                {
                  height: `${FIGURE_HEIGHT_PCT}%`,
                  transform: [
                    { translateX: FIGURE_TO_RULER_NUDGE },
                    { translateY: slideY },
                  ],
                },
              ]}
              resizeMode="contain"
            />
            {/* Soft bottom fade so clipped legs dissolve into the screen. */}
            <LinearGradient
              pointerEvents="none"
              colors={[...figureFadeColors(C.bg)]}
              locations={[0, 0.35, 0.7, 1]}
              style={s.figureFade}
            />
          </View>

          <Pressable
            onPress={startEditing}
            accessibilityRole="button"
            accessibilityLabel="Edit height"
            style={[s.readout, editing && s.readoutActive]}
          >
            {editing ? (
              <View style={s.readoutRow}>
                <TextInput
                  ref={inputRef}
                  value={draft}
                  onChangeText={(t) =>
                    setDraft(t.replace(/[^0-9]/g, "").slice(0, 3))
                  }
                  onBlur={commitDraft}
                  onSubmitEditing={commitDraft}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  maxLength={3}
                  style={s.readoutInput}
                  selectionColor={C.accent}
                  autoFocus
                />
                <Text style={s.readoutUnit}>cm</Text>
              </View>
            ) : (
              <View style={s.readoutRow}>
                <Text style={s.readoutNumber}>{heightCm}</Text>
                <Text style={s.readoutUnit}>cm</Text>
              </View>
            )}
            <Text style={s.readoutHint}>TAP TO EDIT</Text>
          </Pressable>

          <View
            style={[s.meterWrap, { top: meterTop }]}
            pointerEvents="box-none"
          >
            <HeightMeter
              key={gender}
              ref={meterRef}
              min={minCm}
              max={maxCm}
              value={heightCm}
              onChange={handleHeightChange}
              accessibilityLabel="Height meter in centimeters"
            />
          </View>
        </View>

        <OnboardingNav nextDisabled={!chosen} onNext={handleNext} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
  safe: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: "space-between",
    position: "relative",
  },
  flex: {
    flex: 1,
    justifyContent: "space-between",
  },
  body: {
    flex: 1,
    position: "relative",
    paddingLeft: 4,
    paddingRight: 0,
    paddingBottom: 8,
    zIndex: 1,
    // Clip the meter so the half above the head never paints over the header.
    overflow: "hidden",
  },
  // Top edge = header bottom = max-height ceiling for the silhouette head.
  figureFrame: {
    ...StyleSheet.absoluteFillObject,
    // Leave a strip for the overlaid meter so labels stay readable.
    right: 56,
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: C.bg,
  },
  figureImage: {
    width: "100%",
  },
  figureFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "48%",
    zIndex: 2,
  },
  readout: {
    position: "absolute",
    top: 4,
    left: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 4,
    minWidth: 148,
    borderRadius: 14,
    backgroundColor: C.bg3,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  readoutRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  readoutNumber: {
    fontFamily: FONTS.extraBold,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.5,
    color: C.text,
  },
  readoutInput: {
    fontFamily: FONTS.extraBold,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.5,
    color: C.accent,
    minWidth: 88,
    padding: 0,
    margin: 0,
  },
  readoutUnit: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 6,
  },
  readoutHint: {
    marginTop: 6,
    fontFamily: FONTS.bold,
    fontSize: 9,
    letterSpacing: 2,
    color: C.muted2,
  },
  readoutActive: {
    borderColor: C.accent,
  },
  // Ruler rides with the silhouette: accent line stays at the head.
  meterWrap: {
    position: "absolute",
    right: 0,
    height: HEIGHT_METER_VISIBLE,
    zIndex: 3,
  },
});
}

