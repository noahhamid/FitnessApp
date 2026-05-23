import { OAuthButtons, SignUpForm } from "@/src/features/auth";
import { C, FONTS } from "@/src/theme";
import { Link, router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpRoute() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <SignUpForm
          onSuccess={() => router.replace("/(auth)/onboarding/goals")}
        />
        <View style={{ paddingHorizontal: 24 }}>
          <OAuthButtons
            onSuccess={() => router.replace("/(auth)/onboarding/goals")}
          />
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
  scroll: {
    flexGrow: 1,
    paddingTop: 60,
    backgroundColor: C.bg,
    paddingBottom: 40,
  },
  footer: { padding: 24, alignItems: "center" },
  footerText: {
    fontFamily: FONTS.semiBold,
    color: C.accent,
    textAlign: "center",
  },
});
