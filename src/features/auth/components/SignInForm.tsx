import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { PasswordInput } from "@/src/ui/components/PasswordInput";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { SocialAuthButtons } from "./SocialAuthButtons";
import {
  AuthCancelledError,
  isEmailNotVerifiedError,
  signIn,
  signInWithApple,
  signInWithGoogle,
} from "../services/auth.service";
import { navigateAfterAuth } from "../services/post-auth-navigation";
import {
  hasCompletedOnboardingPayload,
  onboardingParamsForNavigation,
  type OnboardingAuthParams,
} from "../services/onboarding-payload.service";
import { clientRequiresEmailVerification } from "@/src/lib/email-verification";

function heroScrim(bgHex: string, resolved: "light" | "dark") {
  const hex = bgHex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (resolved === "light") {
    return [
      `rgba(${r},${g},${b},0.35)`,
      `rgba(${r},${g},${b},0.82)`,
      bgHex,
    ] as const;
  }
  return [
    `rgba(${r},${g},${b},0.55)`,
    `rgba(${r},${g},${b},0.92)`,
    bgHex,
  ] as const;
}

export function SignInForm() {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);
  const params = useLocalSearchParams<OnboardingAuthParams>();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const viewportHeight = height - insets.bottom;
  const scrim = useMemo(
    () => heroScrim(C.bg, resolved),
    [C.bg, resolved],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const canContinue = email.length > 3 && password.length >= 8;
  const completingOnboarding = hasCompletedOnboardingPayload(params);
  const busy = loading || googleLoading || appleLoading;

  async function handleContinue() {
    if (!canContinue) return;
    setLoading(true);
    setError(null);

    try {
      if (!authenticated) {
        await signIn(email, password);
        setAuthenticated(true);
      }
      await navigateAfterAuth(params);
    } catch (e) {
      if (isEmailNotVerifiedError(e) && clientRequiresEmailVerification()) {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: {
            ...onboardingParamsForNavigation(params),
            email: email.trim(),
          },
        });
        return;
      }
      setError(
        e instanceof Error
          ? e.message
          : authenticated
            ? "Signed in, but your setup could not be saved. Try again."
            : "Sign in failed. Try again.",
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
    <View style={[s.root, { height: viewportHeight, maxHeight: viewportHeight }]}>
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.bg}
      />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={s.flex}
          contentContainerStyle={[
            s.scrollContent,
            { minHeight: viewportHeight, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <ImageBackground
            source={require("../../../../assets/images/welcome-gym.jpg")}
            style={s.photoBand}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[...scrim]}
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
            <Text style={s.headline}>
              WELCOME{"\n"}
              <Text style={s.brandMarkAccent}>BACK</Text>.
            </Text>
            <Text style={s.sub}>
              {completingOnboarding
                ? "Sign in to attach this training setup to your account."
                : "Sign in and continue where you left off."}
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
                placeholder="••••••••"
              />
              <Pressable
                style={s.forgotBtn}
                onPress={() =>
                  router.push({
                    pathname: "/(auth)/forgot-password",
                    params: email ? { email } : undefined,
                  })
                }
              >
                <Text style={s.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>

            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <Pressable
              disabled={!canContinue || busy}
              style={[
                s.primaryBtn,
                (!canContinue || busy) && s.primaryBtnDisabled,
              ]}
              onPress={handleContinue}
            >
              {loading ? (
                <ActivityIndicator color={C.onAccent} size="small" />
              ) : (
                <Text style={s.primaryBtnText}>
                  {authenticated ? "RETRY SAVE" : "SIGN IN & CONTINUE"}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={s.linkBtn}
              onPress={() =>
                router.push({
                  pathname: "/(auth)/sign-up",
                  params: onboardingParamsForNavigation(params),
                })
              }
            >
              <Text style={s.linkText}>
                {"Don't have an account? Sign up"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: C.bg,
      overflow: "hidden",
    },
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
    },
    photoBand: { height: 148, justifyContent: "flex-start" },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
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
    forgotBtn: {
      alignSelf: "flex-end",
      marginTop: 10,
      paddingVertical: 4,
    },
    forgotText: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: C.accent,
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
      color: C.onAccent,
      letterSpacing: 1,
    },
    errorText: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: C.red,
      marginBottom: 12,
      textAlign: "center",
    },
    linkBtn: { paddingVertical: 16, alignItems: "center" },
    linkText: { fontFamily: FONTS.regular, fontSize: 13, color: C.muted },
    brandMarkAccent: {
      fontFamily: FONTS.blackItalic,
      color: C.accent,
    },
  });
}
