import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
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
import { PasswordInput } from "@/src/ui/components/PasswordInput";
import { FONTS } from "@/src/ui/tokens";
import { resetPassword } from "../services/auth.service";

const C = {
  bg: "#111318",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#E53935",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function ResetPasswordForm() {
  const params = useLocalSearchParams<{ token?: string; error?: string }>();
  const token = single(params.token);
  const linkError = single(params.error);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    linkError === "INVALID_TOKEN" ? "This reset link is invalid or expired." : null,
  );
  const [done, setDone] = useState(false);

  const canSubmit =
    !!token &&
    password.length >= 8 &&
    password === confirm &&
    !linkError;

  async function handleSubmit() {
    if (!canSubmit || !token || loading) return;
    setLoading(true);
    setError(null);

    try {
      await resetPassword(password, token);
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not reset password. Request a new link.",
      );
    } finally {
      setLoading(false);
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
            <Text style={s.headline}>NEW{"\n"}PASSWORD.</Text>
            <Text style={s.sub}>
              {done
                ? "Your password is updated. Sign in with the new one."
                : "Choose a new password with at least 8 characters."}
            </Text>

            {done ? (
              <Pressable
                style={s.primaryBtn}
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <Text style={s.primaryBtnText}>SIGN IN</Text>
              </Pressable>
            ) : (
              <>
                {!token ? (
                  <Text style={s.errorText}>
                    Missing reset token. Open the link from your email, or
                    request a new one.
                  </Text>
                ) : null}

                <View style={s.field}>
                  <Text style={s.label}>NEW PASSWORD</Text>
                  <PasswordInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 8 characters"
                  />
                </View>

                <View style={s.field}>
                  <Text style={s.label}>CONFIRM PASSWORD</Text>
                  <PasswordInput
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="Repeat password"
                  />
                </View>

                {password.length > 0 &&
                confirm.length > 0 &&
                password !== confirm ? (
                  <Text style={s.errorText}>Passwords do not match.</Text>
                ) : null}

                {error ? <Text style={s.errorText}>{error}</Text> : null}

                <Pressable
                  disabled={!canSubmit || loading}
                  style={[
                    s.primaryBtn,
                    (!canSubmit || loading) && s.primaryBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                >
                  {loading ? (
                    <ActivityIndicator color={C.text} size="small" />
                  ) : (
                    <Text style={s.primaryBtnText}>UPDATE PASSWORD</Text>
                  )}
                </Pressable>

                <Pressable
                  style={s.linkBtn}
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Text style={s.linkText}>Request a new reset link</Text>
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
  field: { marginBottom: 16 },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: C.muted,
    marginBottom: 8,
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
