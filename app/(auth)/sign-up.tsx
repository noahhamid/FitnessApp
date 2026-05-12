import { useState } from "react";
import { ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { Link, router } from "expo-router";

import { SignUpForm, OAuthButtons, signInDemo } from "@/src/features/auth";
import { C, FONTS } from "@/src/theme";

export default function SignUpRoute() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <SignUpForm
          email={email}
          password={password}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onSubmit={async () => {
            await signInDemo();
            router.replace("/(app)/(tabs)");
          }}
        />
        <View style={{ paddingHorizontal: 24 }}>
          <OAuthButtons />
        </View>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity style={s.footer}>
            <Text style={s.footerText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: 60, backgroundColor: C.bg, paddingBottom: 40 },
  footer: { padding: 24, alignItems: "center" },
  footerText: { fontFamily: FONTS.semiBold, color: C.accent, textAlign: "center" },
});
