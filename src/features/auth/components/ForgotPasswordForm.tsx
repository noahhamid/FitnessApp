import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
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
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS } from "@/src/ui/tokens";
import { requestPasswordReset } from "../services/auth.service";

const C = {
  bg: "#111318",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#E53935",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

export function ForgotPasswordForm() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(
    typeof params.email === "string" ? params.email : "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const canSubmit = email.includes("@") && email.length > 4;

  async function handleSubmit() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);

    try {
      const redirectTo = Linking.createURL("/reset-password");
      await requestPasswordReset(email.trim(), redirectTo);
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not send reset link. Try again.",
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
              <Pressable style={s.backBtn} onPress={() => router.back()}>
                <Text style={s.backArrow}>←</Text>
              </Pressable>
            </SafeAreaView>
          </ImageBackground>

          <View style={s.formArea}>
            <Text style={s.headline}>RESET{"\n"}PASSWORD.</Text>
            <Text style={s.sub}>
              {sent
                ? "If that email exists, a reset link is on the way. Check your inbox — and your server logs in local/dev."
                : "Enter the email on your account and we'll send a reset link."}
            </Text>

            {!sent ? (
              <>
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
                    <Text style={s.primaryBtnText}>SEND RESET LINK</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <Pressable
                style={s.primaryBtn}
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <Text style={s.primaryBtnText}>BACK TO SIGN IN</Text>
              </Pressable>
            )}

            <Pressable
              style={s.linkBtn}
              onPress={() => router.replace("/(auth)/sign-in")}
            >
              <Text style={s.linkText}>Remembered it? Sign in</Text>
            </Pressable>
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
