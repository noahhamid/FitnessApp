import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { PasswordInput } from "@/src/ui/components/PasswordInput";
import { FONTS } from "@/src/ui/tokens";
import { SocialAuthButtons } from "./SocialAuthButtons";
import {
  AuthCancelledError,
  signInWithApple,
  signInWithGoogle,
  signUp,
} from "../services/auth.service";
import { navigateAfterAuth } from "../services/post-auth-navigation";
import {
  hasCompletedOnboardingPayload,
  onboardingParamsForNavigation,
  type OnboardingAuthParams,
} from "../services/onboarding-payload.service";

const C = {
  bg: "#111318",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#E53935",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

const BRAND_FOOTER_SIZE = Math.min(Dimensions.get("window").width * 0.17, 96);

export function SignUpForm() {
  const params = useLocalSearchParams<OnboardingAuthParams>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);
  const canContinue = email.length > 3 && password.length >= 8;
  const completingOnboarding = hasCompletedOnboardingPayload(params);
  const busy = loading || googleLoading || appleLoading;

  async function handleContinue() {
    if (!canContinue) return;
    setLoading(true);
    setError(null);

    try {
      if (!accountCreated) {
        await signUp(email, password);
        setAccountCreated(true);
      }
      await navigateAfterAuth(params, { isNewAccount: true });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : accountCreated
            ? "Account created, but your setup could not be saved. Try again."
            : "Sign up failed. Try again.",
      );
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (busy) return;
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      await navigateAfterAuth(params);
    } catch (e) {
      if (e instanceof AuthCancelledError) {
        setGoogleLoading(false);
        return;
      }
      setError(
        e instanceof Error ? e.message : "Google sign-in failed. Try again.",
      );
      setGoogleLoading(false);
    }
  }

  async function handleApple() {
    if (busy) return;
    setAppleLoading(true);
    setError(null);
    try {
      await signInWithApple();
      await navigateAfterAuth(params);
    } catch (e) {
      if (e instanceof AuthCancelledError) {
        setAppleLoading(false);
        return;
      }
      setError(
        e instanceof Error ? e.message : "Apple sign-in failed. Try again.",
      );
      setAppleLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground
            source={require("../../../../assets/images/welcome-gym.jpg")}
            style={s.photoBand}
            resizeMode="cover"
          >
            <View style={s.photoShade} />
            <LinearGradient
              colors={["rgba(17,19,24,0.55)", "rgba(17,19,24,0.92)", C.bg]}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView edges={["top"]}>
              <Pressable style={s.backBtn} onPress={() => router.back()}>
                <Text style={s.backArrow}>←</Text>
              </Pressable>
            </SafeAreaView>
          </ImageBackground>

          <View style={s.formArea}>
            <Text style={s.headline}>CREATE{"\n"}<Text style={s.brandMarkAccent}>ACCOUNT</Text>.</Text>
            <Text style={s.sub}>
              {completingOnboarding
                ? "One final step. Create an account to securely save your training setup."
                : "Create your account, then build a plan around your goals."}
            </Text>

            <SocialAuthButtons
              onGoogle={handleGoogle}
              onApple={handleApple}
              googleLoading={googleLoading}
              appleLoading={appleLoading}
              disabled={busy}
            />

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>OR</Text>
              <View style={s.dividerLine} />
            </View>

            <View style={s.field}>
              <Text style={s.label}>EMAIL</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={C.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={s.input}
                selectionColor={C.accent}
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>PASSWORD</Text>
              <PasswordInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
              />
            </View>

            {error && <Text style={s.errorText}>{error}</Text>}

            <Pressable
              disabled={!canContinue || busy}
              style={[
                s.primaryBtn,
                (!canContinue || busy) && s.primaryBtnDisabled,
              ]}
              onPress={handleContinue}
            >
              {loading ? (
                <ActivityIndicator color={C.text} size="small" />
              ) : (
                <Text style={s.primaryBtnText}>
                  {accountCreated ? "RETRY SAVE" : "CREATE & CONTINUE"}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={s.linkBtn}
              onPress={() =>
                router.push({
                  pathname: "/(auth)/sign-in",
                  params: onboardingParamsForNavigation(params),
                })
              }
            >
              <Text style={s.linkText}>Already have an account? Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Oversized brand mark — baseline flush to the screen bottom. */}
      <View style={s.brandFooter} pointerEvents="none">
        <Text
          style={s.brandMark}
          numberOfLines={1}
          allowFontScaling={false}
          {...(Platform.OS === "android"
            ? { includeFontPadding: false }
            : null)}
        >
          POTENTIAL
          <Text style={s.brandMarkAccent}>PEAK</Text>
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: BRAND_FOOTER_SIZE * 0.55,
  },
  photoBand: { height: 148, justifyContent: "flex-start" },
  photoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 9, 12, 0.62)",
  },
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
  formArea: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  headline: {
    fontFamily: FONTS.blackItalic,
    fontSize: 36,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: C.text,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: C.muted,
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
  },
  dividerText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.muted,
  },
  field: { marginBottom: 16 },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.muted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: C.text,
  },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 16,
  },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnText: {
    fontFamily: FONTS.blackItalic,
    fontSize: 16,
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
  brandFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BRAND_FOOTER_SIZE * 0.72,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  brandMark: {
    fontFamily: FONTS.blackItalic,
    fontSize: BRAND_FOOTER_SIZE,
    lineHeight: BRAND_FOOTER_SIZE * 0.9,
    letterSpacing: -2,
    color: C.text,
    textAlign: "center",
    // Pull the glyph baseline flush with the screen edge.
    marginBottom: -BRAND_FOOTER_SIZE * 0.18,
  },
  brandMarkAccent: {
    fontFamily: FONTS.blackItalic,
    color: C.accent,
  },
});
