import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link, router } from "expo-router";

import { SignInForm, OAuthButtons, signInDemo } from "@/src/features/auth";
import { C, FONTS } from "@/src/theme";

export default function SignInRoute() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <SignInForm
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
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity style={s.footer}>
            <Text style={s.footerText}>Create account</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: 60, backgroundColor: C.bg, paddingBottom: 40 },
  footer: { padding: 24, alignItems: "center" },
  footerText: { fontFamily: FONTS.semiBold, color: C.accent },
});
