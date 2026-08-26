import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { FloatingPaywall } from "./FloatingPaywall";
import { useIap } from "./IapContext";
import { privacyPageUrl, termsPageUrl } from "@/src/lib/public-api-url";
import {
  PREMIUM_ANNUAL_SKU,
  PREMIUM_MONTHLY_SKU,
  SKU_LABEL,
  type PremiumSku,
} from "./skus";

const PERKS = [
  "Guided sessions, log every set, resume anytime",
  "Snap a meal. Macros fill in for you",
  "Calories that follow your weight, not a static plan",
  "Know if you hit this week, streaks, calendar, PRs",
  "Conditioning that fits around lifting, not instead of it",
  "Reminders only on the days you actually train",
];

const SKU_ORDER: PremiumSku[] = [PREMIUM_ANNUAL_SKU, PREMIUM_MONTHLY_SKU];

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

type Props = {
  gender?: string;
  leaving: boolean;
  saveError?: string | null;
  onUnlocked: () => void;
  onLeaveWithoutPurchase: () => void;
};

export function PaywallFlow({
  gender,
  leaving,
  saveError,
  onUnlocked,
  onLeaveWithoutPurchase,
}: Props) {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);
  const {
    products,
    selectedSku,
    setSelectedSku,
    purchase,
    restore,
    purchasing,
    restoring,
    error,
    isPremium,
  } = useIap();
  const [floatOpen, setFloatOpen] = useState(false);

  const heroSource = useMemo(
    () =>
      gender === "female"
        ? require("@/assets/images/genderfemale.jpg")
        : require("@/assets/images/gendermale.jpg"),
    [gender],
  );
  const scrim = useMemo(
    () => heroScrimColors(C.bg, resolved),
    [C.bg, resolved],
  );

  const busy = leaving || purchasing || restoring;
  const selected = products.find((item) => item.id === selectedSku);
  const ctaLabel = selected
    ? `SUBSCRIBE · ${selected.displayPrice}`
    : "SUBSCRIBE";

  async function handlePurchase() {
    if (isPremium) {
      onUnlocked();
      return;
    }
    const ok = await purchase();
    if (ok) onUnlocked();
  }

  async function handleRestore() {
    const ok = await restore();
    if (ok) onUnlocked();
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
              accessibilityLabel="See other offer"
              hitSlop={12}
              style={s.closeBtn}
              disabled={busy}
              onPress={() => setFloatOpen(true)}
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

            <View style={s.skus}>
              {SKU_ORDER.map((sku) => {
                const product = products.find((item) => item.id === sku);
                const active = selectedSku === sku;
                return (
                  <Pressable
                    key={sku}
                    onPress={() => setSelectedSku(sku)}
                    style={[s.sku, active && s.skuActive]}
                  >
                    <Text style={[s.skuLabel, active && s.skuLabelActive]}>
                      {SKU_LABEL[sku]}
                    </Text>
                    <Text style={[s.skuPrice, active && s.skuLabelActive]}>
                      {product?.displayPrice ?? "—"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flex: 1 }} />

            {saveError || error ? (
              <Text style={s.saveError} accessibilityLiveRegion="polite">
                {saveError ?? error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              style={({ pressed }) => [
                s.primaryBtn,
                busy && s.primaryBtnDisabled,
                pressed && s.pressed,
              ]}
              onPress={() => void handlePurchase()}
            >
              {purchasing || leaving ? (
                <ActivityIndicator color={C.onAccent} size="small" />
              ) : (
                <Text style={s.primaryBtnText}>
                  {saveError ? "RETRY SAVE" : ctaLabel}
                </Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void handleRestore()}
              style={s.restoreBtn}
            >
              <Text style={s.restoreText}>
                {restoring ? "Restoring…" : "Restore purchases"}
              </Text>
            </Pressable>

            <Text style={s.legal}>
              Auto-renews until cancelled. Payment is charged to your Apple or
              Google account. Manage in store settings.{" "}
              <Text
                style={s.legalLink}
                onPress={() => void Linking.openURL(privacyPageUrl())}
              >
                Privacy
              </Text>
              {" · "}
              <Text
                style={s.legalLink}
                onPress={() => void Linking.openURL(termsPageUrl())}
              >
                Terms
              </Text>
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <FloatingPaywall
        visible={floatOpen}
        C={C}
        products={products}
        selectedSku={selectedSku}
        onSelectSku={setSelectedSku}
        onPurchase={() => void handlePurchase()}
        onRestore={() => void handleRestore()}
        onDismiss={onLeaveWithoutPurchase}
        purchasing={purchasing || leaving}
        restoring={restoring}
        error={error}
        skuOrder={SKU_ORDER}
      />
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
    skus: { gap: 8, marginBottom: 8 },
    sku: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: C.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    skuActive: { borderColor: C.accent },
    skuLabel: {
      fontFamily: FONTS.semiBold,
      fontSize: 14,
      color: C.text,
    },
    skuLabelActive: { color: C.accent },
    skuPrice: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: C.muted,
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
    restoreBtn: { alignItems: "center", marginTop: 12 },
    restoreText: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: C.text,
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
    legalLink: {
      fontFamily: FONTS.medium,
      fontSize: 11,
      color: C.text,
      textDecorationLine: "underline",
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
