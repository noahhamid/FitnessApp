import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS } from "@/src/ui/tokens";
import { sendVerificationEmail, verifyEmail } from "../services/auth.service";
import { navigateAfterAuth } from "../services/post-auth-navigation";
import {
  onboardingParamsForNavigation,
  type OnboardingAuthParams,
} from "../services/onboarding-payload.service";

const C = {
  bg: "#111318",
  accent: "#E53935",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function VerifyEmailForm() {
  const params = useLocalSearchParams<OnboardingAuthParams & { token?: string }>();
  const email = single(params.email) ?? "";
  const token = single(params.token);

  const [loading, setLoading] = useState(!!token);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifying = useRef(false);

  useEffect(() => {
    if (!token || verifying.current) return;
    verifying.current = true;
    const navParams = params;

    async function confirm() {
      setLoading(true);
      setError(null);
      try {
        await verifyEmail(token!);
        await navigateAfterAuth(navParams);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "This confirmation link is invalid or expired.",
        );
        setLoading(false);
        verifying.current = false;
      }
    }

    void confirm();
    // Token is the only trigger — params are captured for the save-after-verify hop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);
    setError(null);
    try {
      await sendVerificationEmail(email);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not send confirmation email.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={require("../../../../assets/images/auth-hero.jpg")}
            style={s.photoBand}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["transparent", C.bg]}
              locations={[0.4, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView edges={["top"]}>
              <Pressable
                style={s.backBtn}
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <Text style={s.backArrow}>←</Text>
              </Pressable>
            </SafeAreaView>
          </ImageBackground>

          <View style={s.formArea}>
            <Text style={s.headline}>CONFIRM{"\n"}EMAIL.</Text>
            <Text style={s.sub}>
              {loading
                ? "Confirming your email…"
                : email
                  ? `We sent a link to ${email}. Open it on this phone to continue.`
                  : "Open the link we sent to your email on this phone to continue."}
            </Text>

            {error ? <Text style={s.errorText}>{error}</Text> : null}

            {loading ? (
              <ActivityIndicator color={C.text} size="small" />
            ) : (
              <>
                {email ? (
                  <Pressable
                    disabled={resending}
                    style={[s.primaryBtn, resending && s.primaryBtnDisabled]}
                    onPress={() => void handleResend()}
                  >
                    {resending ? (
                      <ActivityIndicator color={C.text} size="small" />
                    ) : (
                      <Text style={s.primaryBtnText}>RESEND LINK</Text>
                    )}
                  </Pressable>
                ) : null}

                <Pressable
                  style={s.linkBtn}
                  onPress={() =>
                    router.replace({
                      pathname: "/(auth)/sign-in",
                      params: onboardingParamsForNavigation(params),
                    })
                  }
                >
                  <Text style={s.linkText}>Back to sign in</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  photoBand: { height: 220, justifyContent: "flex-start" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    marginTop: 8,
  },
  backArrow: { color: C.text, fontSize: 18 },
  formArea: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  headline: {
    fontFamily: FONTS.black,
    fontSize: 34,
    lineHeight: 36,
    color: C.text,
    marginBottom: 8,
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: C.muted,
    marginBottom: 28,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: C.text,
    letterSpacing: 1,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: "#FF5C5C",
    marginBottom: 12,
    textAlign: "center",
  },
  linkBtn: { paddingVertical: 16, alignItems: "center" },
  linkText: { fontFamily: FONTS.regular, fontSize: 13, color: C.muted },
});
