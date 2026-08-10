import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import { onboardingParamsForNavigation } from "@/src/features/auth/services/onboarding-payload.service";
import { authClient } from "@/src/lib/auth";
import { C, FONTS } from "@/src/ui/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Gift, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PERKS = [
  "Personalized workout split",
  "Nutrition targets tuned to your pace",
  "Injury-aware exercise swaps",
];

const FULL_PRICE = 35.99;
const DISCOUNT_PRICE = 26.99;
const SAVE_AMOUNT = (FULL_PRICE - DISCOUNT_PRICE).toFixed(2);

export default function PaywallScreen() {
  const params = useLocalSearchParams<{ gender?: string }>();
  const [offerOpen, setOfferOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const alreadyAuthed = !!session?.user;

  const heroSource = useMemo(
    () =>
      params.gender === "female"
        ? require("@/assets/images/genderfemale.jpg")
        : require("@/assets/images/gendermale.jpg"),
    [params.gender],
  );

  function finish(offerAccepted: boolean) {
    setOfferOpen(false);
    useAuthStore.getState().setPremiumUnlocked(offerAccepted);

    if (alreadyAuthed) {
      router.replace("/(app)/(tabs)");
      return;
    }

    router.push({
      pathname: "/(auth)/sign-up",
      params: onboardingParamsForNavigation({
        ...params,
        onboardingComplete: "1",
        offerAccepted: offerAccepted ? "1" : "0",
      }),
    });
  }

  /** Exit intent: first skip/close surfaces the discount offer. */
  function onDismissAttempt() {
    setOfferOpen(true);
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ImageBackground source={heroSource} style={s.hero} resizeMode="cover">
        <LinearGradient
          colors={[
            "rgba(17,19,24,0.35)",
            "rgba(17,19,24,0.72)",
            "rgba(17,19,24,0.96)",
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
          <View style={s.content}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip"
              hitSlop={12}
              style={s.closeBtn}
              onPress={onDismissAttempt}
            >
              <X size={22} color={C.muted} strokeWidth={2.2} />
            </Pressable>

            <View style={{ flex: 1 }} />

            <Text style={s.kicker}>UNLOCK EVERYTHING</Text>
            <Text style={s.headline}>YOUR FULL{"\n"}PLAN IS READY.</Text>

            <View style={s.perks}>
              {PERKS.map((perk) => (
                <View key={perk} style={s.perkRow}>
                  <View style={s.perkDot} />
                  <Text style={s.perkText}>{perk}</Text>
                </View>
              ))}
            </View>

            <View style={s.priceCard}>
              <Text style={s.priceLabel}>12 MONTHS</Text>
              <Text style={s.price}>${FULL_PRICE.toFixed(2)} / year</Text>
              <Text style={s.priceNote}>Cancel anytime</Text>
            </View>

            <View style={{ flex: 1 }} />

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [s.primaryBtn, pressed && s.pressed]}
              onPress={() => setOfferOpen(true)}
            >
              <Text style={s.primaryBtnText}>UNLOCK NOW</Text>
            </Pressable>

            <Text style={s.legal}>
              Total ${FULL_PRICE.toFixed(2)}/Year, cancel anytime.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <Modal
        visible={offerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => finish(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <View style={s.modalHero}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close offer"
                hitSlop={10}
                style={s.modalClose}
                onPress={() => finish(false)}
              >
                <X size={18} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
              <Gift size={36} color="#FFFFFF" strokeWidth={2} />
              <Text style={s.modalHeroEyebrow}>EXTRA</Text>
              <Text style={s.modalHeroDeal}>25% OFF</Text>
            </View>

            <View style={s.modalBody}>
              <Text style={s.modalHeadline}>
                WAIT! A PERSONAL OFFER{"\n"}JUST FOR YOU.
              </Text>

              <View style={s.priceCompare}>
                <View style={[s.compareCard, s.compareCardMuted]}>
                  <Text style={s.compareTerm}>12 Months</Text>
                  <Text style={s.compareWas}>
                    ${FULL_PRICE.toFixed(2)}
                    <Text style={s.compareUnit}> /Year</Text>
                  </Text>
                </View>

                <View style={s.compareArrow} />

                <View style={[s.compareCard, s.compareCardActive]}>
                  <Text style={s.compareTerm}>12 Months</Text>
                  <Text style={s.compareNow}>
                    ${DISCOUNT_PRICE.toFixed(2)}
                    <Text style={s.compareUnitActive}> /Year</Text>
                  </Text>
                </View>
              </View>

              <Text style={s.saveLine}>SAVE ${SAVE_AMOUNT} IN TOTAL!</Text>

              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  s.modalContinue,
                  pressed && s.pressed,
                ]}
                onPress={() => finish(true)}
              >
                <Text style={s.modalContinueText}>CONTINUE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
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
    backgroundColor: "rgba(17,19,24,0.55)",
  },
  kicker: {
    fontFamily: FONTS.blackItalic,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 2.5,
    color: C.accent,
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: FONTS.blackItalic,
    fontSize: 38,
    lineHeight: 44,
    color: C.text,
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 4,
    textTransform: "uppercase",
  },
  perks: {
    gap: 12,
    marginBottom: 20,
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
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    color: C.text,
  },
  priceCard: {
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: "rgba(34,34,34,0.72)",
  },
  priceLabel: {
    fontFamily: FONTS.blackItalic,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 2,
    color: C.muted,
    textTransform: "uppercase",
  },
  price: {
    marginTop: 4,
    fontFamily: FONTS.blackItalic,
    fontSize: 28,
    lineHeight: 34,
    color: C.text,
    letterSpacing: -0.5,
  },
  priceNote: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
    color: C.muted2,
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
  primaryBtnText: {
    fontFamily: FONTS.blackItalic,
    fontSize: 18,
    lineHeight: 24,
    color: "#FFFFFF",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  legal: {
    marginTop: 14,
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 16,
    color: C.muted2,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.85,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  modalHero: {
    backgroundColor: C.accent,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalHeroEyebrow: {
    marginTop: 10,
    fontFamily: FONTS.blackItalic,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 1,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  modalHeroDeal: {
    fontFamily: FONTS.blackItalic,
    fontSize: 40,
    lineHeight: 48,
    color: "#FFE082",
    letterSpacing: -0.5,
    textTransform: "uppercase",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 22,
  },
  modalHeadline: {
    fontFamily: FONTS.blackItalic,
    fontSize: 22,
    lineHeight: 28,
    color: "#111318",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: -0.2,
    textTransform: "uppercase",
  },
  priceCompare: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compareCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    overflow: "visible",
    backgroundColor: "#F4F4F5",
  },
  compareCardMuted: {
    opacity: 0.55,
  },
  compareCardActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: C.accent,
  },
  compareTerm: {
    fontFamily: FONTS.blackItalic,
    fontSize: 12,
    lineHeight: 16,
    color: "#666666",
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  compareWas: {
    fontFamily: FONTS.blackItalic,
    fontSize: 18,
    lineHeight: 24,
    color: C.accent,
    textDecorationLine: "line-through",
  },
  compareNow: {
    fontFamily: FONTS.blackItalic,
    fontSize: 20,
    lineHeight: 26,
    color: C.accent,
  },
  compareUnit: {
    fontFamily: FONTS.blackItalic,
    fontSize: 11,
    lineHeight: 16,
    color: "#888888",
  },
  compareUnitActive: {
    fontFamily: FONTS.blackItalic,
    fontSize: 11,
    lineHeight: 16,
    color: "#888888",
  },
  compareArrow: {
    width: 16,
    alignItems: "center",
  },
  saveLine: {
    marginTop: 12,
    fontFamily: FONTS.blackItalic,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: C.accent,
    textAlign: "center",
    textTransform: "uppercase",
  },
  modalContinue: {
    marginTop: 18,
    backgroundColor: C.accent,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContinueText: {
    fontFamily: FONTS.blackItalic,
    fontSize: 18,
    lineHeight: 24,
    color: "#FFFFFF",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
