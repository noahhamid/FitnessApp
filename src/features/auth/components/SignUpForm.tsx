import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import * as WebBrowser from "expo-web-browser";
import { useSignUp } from "../hooks/useAuth";
import { authClient } from "@/src/lib/auth-client";

WebBrowser.maybeCompleteAuthSession();

const COLORS = {
  canvas: "#121212",
  surface: "#1E1E1E",
  border: "#2A2A2A",
  borderFocused: "#FFC700",
  accent: "#FFC700",
  textPrimary: "#FFFFFF",
  textMuted: "#A0A0A0",
  textHint: "#555555",
  errorRed: "#FF4D6A",
  errorRedDim: "rgba(255,77,106,0.10)",
  divider: "#232323",
};

type Props = {
  onSuccess: () => void;
  onSignIn?: () => void;
};

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleIcon() {
  return (
    <Svg width={16} height={20} viewBox="0 0 18 22">
      <Path
        d="M14.96 11.56c-.02-2.23 1.82-3.31 1.9-3.36-1.04-1.52-2.65-1.72-3.22-1.74-1.37-.14-2.67.81-3.37.81-.7 0-1.78-.79-2.93-.77-1.51.02-2.9.88-3.68 2.24C1.9 11.6 2.98 15.86 4.7 18.23c.86 1.23 1.88 2.62 3.22 2.57 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.8 1.39-.02 2.27-1.27 3.12-2.51.99-1.43 1.4-2.82 1.42-2.89-.03-.01-2.72-1.04-2.21-3.81zM12.68 4.37c.71-.87 1.19-2.07 1.06-3.27-1.02.04-2.26.68-2.99 1.53-.66.75-1.23 1.96-1.08 3.12 1.14.09 2.3-.58 3.01-1.38z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export function SignUpForm({ onSuccess, onSignIn }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<"google" | "apple" | null>(null);
  const [ssoError, setSsoError] = useState<string | null>(null);

  const { mutateAsync: signUp, isPending, error } = useSignUp();

  const isLoading = isPending || ssoLoading !== null;
  const passwordTooShort = password.length > 0 && password.length < 8;
  const canSubmit = !!email && password.length >= 8 && !isLoading;

  async function handleSubmit() {
    if (!canSubmit) return;
    await signUp({ email, password });
    onSuccess();
  }

  async function handleGoogleSignUp() {
    if (isLoading) return;
    setSsoError(null);
    setSsoLoading("google");
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (error) {
        setSsoError(
          error.message ?? "Google sign-in failed. Please try again.",
        );
        return;
      }
      onSuccess();
    } catch (e: any) {
      setSsoError(e?.message ?? "Google sign-in failed. Please try again.");
    } finally {
      setSsoLoading(null);
    }
  }

  async function handleAppleSignUp() {
    if (isLoading) return;
    setSsoError(null);
    setSsoLoading("apple");
    try {
      const { error } = await authClient.signIn.social({
        provider: "apple",
        callbackURL: "/",
      });
      if (error) {
        setSsoError(error.message ?? "Apple sign-in failed. Please try again.");
        return;
      }
      onSuccess();
    } catch (e: any) {
      setSsoError(e?.message ?? "Apple sign-in failed. Please try again.");
    } finally {
      setSsoLoading(null);
    }
  }

  return (
    <View style={s.canvas}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.eyebrow}>GET STARTED</Text>
        <Text style={s.title}>CREATE{"\n"}ACCOUNT.</Text>
        <Text style={s.subtitle}>
          Join thousands of users already on the platform.
        </Text>
      </View>

      {/* ── Form Fields ────────────────────────────────── */}
      <View style={s.form}>
        {/* Email */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>EMAIL ADDRESS</Text>
          <View style={[s.inputSurface, emailFocused && s.inputSurfaceFocused]}>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textHint}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
        </View>

        {/* Password */}
        <View style={s.fieldGroup}>
          <Text style={s.label}>PASSWORD</Text>
          <View
            style={[
              s.inputSurface,
              passwordFocused && s.inputSurfaceFocused,
              passwordTooShort && s.inputSurfaceError,
            ]}
          >
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 characters"
              placeholderTextColor={COLORS.textHint}
              secureTextEntry
              editable={!isLoading}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>
          {passwordTooShort && (
            <View style={s.hintRow}>
              <Text style={s.hintDot}>●</Text>
              <Text style={s.hintText}>
                Password must be at least 8 characters.
              </Text>
            </View>
          )}
        </View>

        {/* API / SSO errors */}
        {(error || ssoError) && (
          <View style={s.errorBanner}>
            <Text style={s.errorText}>
              {ssoError ??
                ((error as Error)?.message ||
                  "Sign up failed. Please try again.")}
            </Text>
          </View>
        )}

        {/* ── Primary CTA ──────────────────────────────── */}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            s.primaryBtn,
            !canSubmit && s.primaryBtnDisabled,
            pressed && canSubmit && s.primaryBtnPressed,
          ]}
        >
          {isPending ? (
            <View style={s.loadingRow}>
              <ActivityIndicator color={COLORS.canvas} size="small" />
              <Text style={s.primaryBtnLabel}>CREATING ACCOUNT…</Text>
            </View>
          ) : (
            <Text style={s.primaryBtnLabel}>SIGN UP</Text>
          )}
        </Pressable>

        {/* ── Divider ──────────────────────────────────── */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerLabel}>OR</Text>
          <View style={s.dividerLine} />
        </View>

        {/* ── SSO Buttons ──────────────────────────────── */}
        <View style={s.ssoRow}>
          <Pressable
            onPress={handleGoogleSignUp}
            disabled={isLoading}
            style={({ pressed }) => [
              s.ssoBtn,
              pressed && !isLoading && s.ssoBtnPressed,
              isLoading && s.ssoBtnDisabled,
            ]}
          >
            <View style={s.ssoIconBox}>
              {ssoLoading === "google" ? (
                <ActivityIndicator color={COLORS.textPrimary} size="small" />
              ) : (
                <GoogleIcon />
              )}
            </View>
            <Text style={s.ssoBtnLabel}>
              {ssoLoading === "google" ? "Connecting…" : "Google"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleAppleSignUp}
            disabled={isLoading}
            style={({ pressed }) => [
              s.ssoBtn,
              pressed && !isLoading && s.ssoBtnPressed,
              isLoading && s.ssoBtnDisabled,
            ]}
          >
            <View style={s.ssoIconBox}>
              {ssoLoading === "apple" ? (
                <ActivityIndicator color={COLORS.textPrimary} size="small" />
              ) : (
                <AppleIcon />
              )}
            </View>
            <Text style={s.ssoBtnLabel}>
              {ssoLoading === "apple" ? "Connecting…" : "Apple"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Footer ─────────────────────────────────────── */}
      <Text style={s.footerText}>
        Already have an account?{" "}
        <Text style={s.footerLink} onPress={!isLoading ? onSignIn : undefined}>
          Sign in
        </Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: COLORS.canvas,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 3,
    color: COLORS.accent,
    fontWeight: "600",
    marginBottom: 10,
  },
  title: {
    fontSize: 52,
    lineHeight: 52,
    color: COLORS.textPrimary,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  // ── Form ────────────────────────────────────────────
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  // ── Inputs ──────────────────────────────────────────
  inputSurface: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  inputSurfaceFocused: {
    borderColor: COLORS.borderFocused,
  },
  inputSurfaceError: {
    borderColor: COLORS.errorRed,
    backgroundColor: COLORS.errorRedDim,
  },
  input: {
    fontSize: 15,
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
  },

  // ── Validation hint ─────────────────────────────────
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  hintDot: {
    fontSize: 5,
    color: COLORS.errorRed,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.errorRed,
  },

  // ── Error banner ────────────────────────────────────
  errorBanner: {
    backgroundColor: COLORS.errorRedDim,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.errorRed,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.errorRed,
    lineHeight: 18,
  },

  // ── Primary button ──────────────────────────────────
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.35,
  },
  primaryBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.988 }],
  },
  primaryBtnLabel: {
    fontSize: 15,
    letterSpacing: 2,
    color: COLORS.canvas,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // ── Divider ─────────────────────────────────────────
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.textHint,
    fontWeight: "600",
  },

  // ── SSO ─────────────────────────────────────────────
  ssoRow: {
    flexDirection: "row",
    gap: 10,
  },
  ssoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  ssoIconBox: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  ssoBtnPressed: {
    borderColor: COLORS.accent,
    backgroundColor: "#242424",
  },
  ssoBtnDisabled: {
    opacity: 0.35,
  },
  ssoBtnLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  // ── Footer ──────────────────────────────────────────
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 28,
  },
  footerLink: {
    color: COLORS.accent,
    fontWeight: "600",
  },
});
