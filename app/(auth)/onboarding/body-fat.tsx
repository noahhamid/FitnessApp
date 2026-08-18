import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { estimateBodyFatPercent } from "@/src/lib/body-composition";
import {
  BODY_FAT_BANDS,
  bandContaining,
  bandIndex,
  clampBodyFatPercent,
  formatBandRange,
  formatBodyFatPercent,
  sanitizeBodyFatDraft,
  type BodyFatGender,
} from "@/src/lib/body-fat-bands";
import { BodyFatRangeSlider } from "@/src/ui/components/BodyFatRangeSlider";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function parseSavedPercent(raw?: string): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? clampBodyFatPercent(n) : undefined;
}

export default function OnboardingBodyFatScreen() {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);
  const params = useLocalSearchParams<{
    gender?: string;
    age?: string;
    heightCm?: string;
    weightKg?: string;
    bodyFatPercent?: string;
    bodyFatSource?: string;
  }>();

  const gender: BodyFatGender = params.gender === "female" ? "female" : "male";
  const bands = BODY_FAT_BANDS[gender];

  const heightCm = Number(params.heightCm);
  const weightKg = Number(params.weightKg);
  const age = Number(params.age);

  const savedPercent = parseSavedPercent(params.bodyFatPercent);
  const savedMeasured = params.bodyFatSource === "measured" && savedPercent != null;

  const defaultBand = useMemo(() => {
    if (savedPercent != null) return bandContaining(gender, savedPercent);
    if (
      Number.isFinite(heightCm) &&
      heightCm > 0 &&
      Number.isFinite(weightKg) &&
      weightKg > 0 &&
      Number.isFinite(age) &&
      age > 0
    ) {
      return bandContaining(
        gender,
        estimateBodyFatPercent({ gender, age, heightCm, weightKg }),
      );
    }
    return bands[2];
  }, [age, bands, gender, heightCm, savedPercent, weightKg]);

  const [index, setIndex] = useState(() => bandIndex(gender, defaultBand));
  const [measured, setMeasured] = useState<number | undefined>(
    savedMeasured ? savedPercent : undefined,
  );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    savedMeasured && savedPercent != null
      ? formatBodyFatPercent(savedPercent)
      : "",
  );
  const inputRef = useRef<TextInput>(null);

  const band = bands[index] ?? bands[2];
  const displayValue = measured ?? band.midpoint;

  const handleBandIndex = useCallback((next: number) => {
    setIndex(next);
    setMeasured(undefined);
    setDraft("");
    setEditing(false);
  }, []);

  const startEditing = () => {
    setDraft(formatBodyFatPercent(displayValue));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const commitDraft = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || draft.trim() === "") {
      setDraft(measured != null ? formatBodyFatPercent(measured) : "");
      setEditing(false);
      return;
    }
    const next = clampBodyFatPercent(parsed);
    setMeasured(next);
    setIndex(bandIndex(gender, bandContaining(gender, next)));
    setDraft(formatBodyFatPercent(next));
    setEditing(false);
  };

  const forwardParams = (extras: Record<string, string>) => ({
    ...params,
    ...extras,
  });

  const handleNext = () => {
    const percent = measured ?? band.midpoint;
    router.push({
      pathname: "/(auth)/onboarding/target-weight",
      params: forwardParams({
        bodyFatStep: "1",
        bodyFatPercent: formatBodyFatPercent(percent),
        bodyFatSource: measured != null ? "measured" : "range",
      }),
    });
  };

  const handleSkip = () => {
    const { bodyFatPercent: _p, bodyFatSource: _s, ...rest } = params;
    router.push({
      pathname: "/(auth)/onboarding/target-weight",
      params: {
        ...rest,
        bodyFatStep: "1",
        bodyFatPercent: "",
        bodyFatSource: "",
      },
    });
  };

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <OnboardingHeader
          headline={"YOUR\nBODY FAT."}
          sub="Pick a range — or type a precise % if you know it."
          onBack={() => router.back()}
        />

        <View style={s.body}>
          <Pressable
            onPress={startEditing}
            accessibilityRole="button"
            accessibilityLabel="Enter precise body fat percent"
            style={[s.readout, editing && s.readoutActive]}
          >
            {editing ? (
              <View style={s.readoutRow}>
                <TextInput
                  ref={inputRef}
                  value={draft}
                  onChangeText={(t) => setDraft(sanitizeBodyFatDraft(t))}
                  onBlur={commitDraft}
                  onSubmitEditing={commitDraft}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  style={s.readoutInput}
                  selectionColor={C.accent}
                  autoFocus
                />
                <Text style={s.readoutUnit}>%</Text>
              </View>
            ) : (
              <View style={s.readoutRow}>
                <Text
                  style={[
                    s.readoutNumber,
                    measured == null && s.readoutMuted,
                  ]}
                >
                  {formatBodyFatPercent(displayValue)}
                </Text>
                <Text style={s.readoutUnit}>%</Text>
              </View>
            )}
            <Text style={s.readoutHint}>
              {measured != null ? "TAP TO EDIT" : "TAP TO TYPE A PRECISE %"}
            </Text>
          </Pressable>

          <View style={s.rangeBlock}>
            <Text style={s.rangeName}>{band.label}</Text>
            <Text style={s.rangeSpan}>{formatBandRange(band)}</Text>
            <BodyFatRangeSlider
              bands={bands}
              index={index}
              onChangeIndex={handleBandIndex}
            />
          </View>

          <Text style={s.helper}>
            Until you type a %, we use the middle of the range. That’s better
            than guessing from BMI.
          </Text>
        </View>

        <View>
          <OnboardingNav onNext={handleNext} />
          <Pressable
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip and estimate from BMI"
            style={({ pressed }) => [s.skipBtn, pressed && s.skipPressed]}
          >
            <Text style={s.skipText}>Skip — estimate from BMI</Text>
          </Pressable>
        </View>
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 20,
      zIndex: 1,
    },
    readout: {
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      minWidth: 180,
      borderRadius: 14,
      backgroundColor: C.bg3,
      borderWidth: 1.5,
      borderColor: C.border,
    },
    readoutActive: {
      borderColor: C.accent,
    },
    readoutRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 6,
    },
    readoutNumber: {
      fontFamily: FONTS.blackItalic,
      fontSize: 44,
      lineHeight: 48,
      letterSpacing: -1.5,
      color: C.text,
    },
    readoutMuted: {
      color: C.muted,
    },
    readoutInput: {
      fontFamily: FONTS.blackItalic,
      fontSize: 44,
      lineHeight: 48,
      letterSpacing: -1.5,
      color: C.accent,
      minWidth: 100,
      padding: 0,
      margin: 0,
      textAlign: "center",
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
      letterSpacing: 1.4,
      color: C.muted2,
    },
    rangeBlock: {
      width: "100%",
      alignItems: "center",
      gap: 6,
    },
    rangeName: {
      fontFamily: FONTS.extraBold,
      fontSize: 22,
      letterSpacing: 0.4,
      color: C.text,
      textTransform: "uppercase",
    },
    rangeSpan: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: C.accent,
      marginBottom: 10,
    },
    helper: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      lineHeight: 19,
      color: C.muted,
      textAlign: "center",
      paddingHorizontal: 8,
    },
    skipBtn: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 18,
      marginHorizontal: 24,
      marginTop: 10,
      borderRadius: 12,
      backgroundColor: "#000000",
    },
    skipPressed: {
      opacity: 0.85,
    },
    skipText: {
      fontFamily: FONTS.blackItalic,
      fontSize: 15,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: "#FFFFFF",
    },
  });
}
