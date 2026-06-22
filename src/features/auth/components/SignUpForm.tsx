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
import { useSignUp } from "../hooks/useAuth";

const COLORS = {
  canvas: "#0A0A0C",
  surface: "#141417",
  surfaceRaised: "#1C1C21",
  border: "#2A2A32",
  accent: "#C8F135",
  textPrimary: "#FFFFFF",
  textSecondary: "#8A8A9A",
  textMuted: "#4A4A5A",
  errorRed: "#FF4D6A",
  errorRedDim: "rgba(255,77,106,0.10)",
  divider: "#232329",
};

type Props = {
  onSuccess: () => void;
  onSignIn?: () => void;
};

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
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
    <Svg width={18} height={22} viewBox="0 0 18 22">
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

  const { mutateAsync: signUp, isPending, error } = useSignUp();
  const isLoading = isPending;

  async function handleSubmit() {
    if (!email || password.length < 8 || isLoading) return;
    await signUp({ email, password });
    onSuccess();
  }

  async function handleGoogleSSO() {
    // Wire to your OAuth flow here.
  }

  async function handleAppleSSO() {
    // Wire to your OAuth flow here.
  }

  const passwordTooShort = password.length > 0 && password.length < 8;
  const canSubmit = !!email && password.length >= 8 && !isLoading;

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
              placeholderTextColor={COLORS.textMuted}
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
              placeholderTextColor={COLORS.textMuted}
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

        {/* API error */}
        {error && (
          <View style={s.errorBanner}>
            <Text style={s.errorText}>
              {(error as Error).message ?? "Sign up failed. Please try again."}
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
          {isLoading ? (
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
          <Text style={s.dividerLabel}>OR CONTINUE WITH</Text>
          <View style={s.dividerLine} />
        </View>

        {/* ── SSO Buttons ──────────────────────────────── */}
        <View style={s.ssoStack}>
          <Pressable
            onPress={handleGoogleSSO}
            disabled={isLoading}
            style={({ pressed }) => [
              s.ssoBtn,
              pressed && s.ssoBtnPressed,
              isLoading && s.ssoBtnDisabled,
            ]}
          >
            <View style={s.ssoIconBox}>
              <GoogleIcon />
            </View>
            <Text style={s.ssoBtnLabel}>Continue with Google</Text>
          </Pressable>

          <Pressable
            onPress={handleAppleSSO}
            disabled={isLoading}
            style={({ pressed }) => [
              s.ssoBtn,
              pressed && s.ssoBtnPressed,
              isLoading && s.ssoBtnDisabled,
            ]}
          >
            <View style={s.ssoIconBox}>
              <AppleIcon />
            </View>
            <Text style={s.ssoBtnLabel}>Continue with Apple</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Footer ─────────────────────────────────────── */}
      <Text style={s.footerText}>
        Already have an account?{" "}
        <Text style={s.footerLink} onPress={onSignIn}>
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
  header: { marginBottom: 36 },
  eyebrow: {
    fontFamily: "DMSans-Medium",
    fontSize: 11,
    letterSpacing: 3,
    color: COLORS.accent,
    marginBottom: 10,
  },
  title: {
    fontFamily: "BarlowCondensed-Bold",
    fontSize: 52,
    lineHeight: 52,
    color: COLORS.textPrimary,
    textTransform: "uppercase",
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  form: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: {
    fontFamily: "DMSans-Medium",
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.textSecondary,
  },
  inputSurface: {
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputSurfaceFocused: {
    borderColor: COLORS.accent,
    backgroundColor: "#1E1E24",
  },
  inputSurfaceError: {
    borderColor: COLORS.errorRed,
    backgroundColor: COLORS.errorRedDim,
  },
  input: {
    fontFamily: "DMSans-Regular",
    fontSize: 15,
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  hintDot: { fontSize: 5, color: COLORS.errorRed },
  hintText: {
    fontFamily: "DMSans-Regular",
    fontSize: 12,
    color: COLORS.errorRed,
  },
  errorBanner: {
    backgroundColor: COLORS.errorRedDim,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.errorRed,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: "DMSans-Regular",
    fontSize: 13,
    color: COLORS.errorRed,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnPressed: { opacity: 0.88, transform: [{ scale: 0.988 }] },
  primaryBtnLabel: {
    fontFamily: "BarlowCondensed-Bold",
    fontSize: 16,
    letterSpacing: 2,
    color: COLORS.canvas,
    textTransform: "uppercase",
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.divider },
  dividerLabel: {
    fontFamily: "DMSans-Medium",
    fontSize: 10,
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },
  ssoStack: { gap: 10 },
  ssoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  ssoIconBox: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ssoBtnPressed: { backgroundColor: "#22222A", borderColor: COLORS.accent },
  ssoBtnDisabled: { opacity: 0.35 },
  ssoBtnLabel: {
    fontFamily: "DMSans-Medium",
    fontSize: 15,
    color: COLORS.textPrimary,
    letterSpacing: 0.1,
  },
  footerText: {
    fontFamily: "DMSans-Regular",
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 24,
  },
  footerLink: {
    color: COLORS.accent,
    fontFamily: "DMSans-Medium",
  },
});
