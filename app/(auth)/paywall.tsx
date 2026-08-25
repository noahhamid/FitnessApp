import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import {
  onboardingParamsForNavigation,
  saveCompletedOnboardingPayload,
  type OnboardingAuthParams,
} from "@/src/features/auth/services/onboarding-payload.service";
import {
  clearOnboardingDraft,
  saveOnboardingDraft,
} from "@/src/features/auth/services/onboarding-draft.service";
import { authClient } from "@/src/lib/auth";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PERKS = [
  "Guided sessions, log every set, resume anytime",
  "Snap a meal. Macros fill in for you",
  "Calories that follow your weight, not a static plan",
  "Know if you hit this week, streaks, calendar, PRs",
  "Conditioning that fits around lifting, not instead of it",
  "Reminders only on the days you actually train",
];

function heroScrimColors(bgHex: string, resolved: "light" | "dark") {
  const hex = bgHex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (resolved === "light") {
    return [
      `rgba(${r},${g},${b},0.2)`,
      `rgba(${r},${g},${b},0.78)`,
      `rgba(${r},${g},${b},0.98)`,
    ] as const;
  }
  return [
    `rgba(${r},${g},${b},0.35)`,
    `rgba(${r},${g},${b},0.72)`,
    `rgba(${r},${g},${b},0.96)`,
  ] as const;
}

export default function PaywallScreen() {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);
  const params = useLocalSearchParams<OnboardingAuthParams>();
  const [leaving, setLeaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data: session } = authClient.useSession();
  const alreadyAuthed = !!session?.user;

  const heroSource = useMemo(
    () =>
      params.gender === "female"
        ? require("@/assets/images/genderfemale.jpg")
        : require("@/assets/images/gendermale.jpg"),
    [params.gender],
  );

  const scrim = useMemo(
    () => heroScrimColors(C.bg, resolved),
    [C.bg, resolved],
  );

  async function finish() {
    if (leaving) return;
    setLeaving(true);
    setSaveError(null);
    useAuthStore.getState().setPremiumUnlocked(true);

    const nextParams = onboardingParamsForNavigation({
      ...params,
      onboardingComplete: "1",
      offerAccepted: "1",
    });
    await saveOnboardingDraft(nextParams);

    if (alreadyAuthed) {
      try {
        const saved = await saveCompletedOnboardingPayload(nextParams);
        if (!saved) {
          setSaveError(
            "Signed in, but we couldn't save your plan yet. Confirm your email, then try again.",
          );
          setLeaving(false);
          return;
        }
        await clearOnboardingDraft();
        useAuthStore.getState().setOnboarded(true);
        router.replace("/(app)/(tabs)");
      } catch {
        setSaveError(
          "Your plan could not be saved. Check your connection and try again.",
        );
        setLeaving(false);
      }
      return;
    }

    router.replace({
      pathname: "/(auth)/sign-up",
      params: nextParams,
    });
  }

  return (
    <View style={s.root}>
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground source={heroSource} style={s.hero} resizeMode="cover">
        <LinearGradient
          colors={[...scrim]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
          <View style={s.content}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue"
              hitSlop={12}
              style={s.closeBtn}
              onPress={() => void finish()}
            >
              <X size={22} color={C.muted} strokeWidth={2.2} />
            </Pressable>

            <View style={{ flex: 1 }} />

            <Text style={s.kicker} numberOfLines={1}>
              YOUR PLAN
            </Text>
            <Text
              style={s.headline}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              allowFontScaling={false}
            >
              YOUR FULL PLAN IS READY.
            </Text>

            <View style={s.perks}>
              {PERKS.map((perk) => (
                <View key={perk} style={s.perkRow}>
                  <View style={s.perkDot} />
                  <Text style={s.perkText}>{perk}</Text>
                </View>
              ))}
            </View>

            <View style={{ flex: 1 }} />

            {saveError ? (
              <Text style={s.saveError} accessibilityLiveRegion="polite">
                {saveError}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={leaving}
              style={({ pressed }) => [
                s.primaryBtn,
                leaving && s.primaryBtnDisabled,
                pressed && s.pressed,
              ]}
              onPress={() => void finish()}
            >
              {leaving ? (
                <ActivityIndicator color={C.onAccent} size="small" />
              ) : (
                <Text style={s.primaryBtnText}>
                  {saveError ? "RETRY SAVE" : "CONTINUE"}
                </Text>
              )}
            </Pressable>

            <Text style={s.legal}>No purchase required — this is a preview.</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: C.bg,
    },
    hero: {
      flex: 1,
    },
    safe: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    closeBtn: {
      alignSelf: "flex-end",
      marginTop: 8,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    kicker: {
      fontFamily: FONTS.blackItalic,
      fontSize: 14,
      letterSpacing: 2.5,
      color: C.accent,
      textAlign: "center",
      marginBottom: 10,
      textTransform: "uppercase",
    },
    headline: {
      fontFamily: FONTS.blackItalic,
      fontSize: 36,
      color: C.text,
      letterSpacing: -0.5,
      textAlign: "center",
      marginBottom: 24,
      textTransform: "uppercase",
    },
    perks: {
      gap: 8,
      marginBottom: 16,
    },
    perkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    perkDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: C.accent,
    },
    perkText: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: 13,
      lineHeight: 18,
      color: C.text,
      paddingBottom: 8,
    },
    primaryBtn: {
      backgroundColor: C.accent,
      borderRadius: 999,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: C.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryBtnDisabled: {
      opacity: 0.55,
    },
    primaryBtnText: {
      fontFamily: FONTS.blackItalic,
      fontSize: 16,
      letterSpacing: 1,
      color: C.onAccent,
      textTransform: "uppercase",
      textAlign: "center",
    },
    saveError: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: C.red,
      textAlign: "center",
      marginBottom: 12,
    },
    legal: {
      marginTop: 14,
      fontFamily: FONTS.regular,
      fontSize: 11,
      color: C.muted2,
      textAlign: "center",
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
