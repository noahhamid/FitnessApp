import { SignInForm } from "@/src/features/auth";
import { getPostSignInRoute } from "@/src/lib/routing";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function SignInRoute() {
  async function navigateAfterAuth() {
    const route = await getPostSignInRoute();
    router.replace(route as Parameters<typeof router.replace>[0]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <SignInForm
          onSuccess={navigateAfterAuth}
          onForgotPassword={() => router.push("/(auth)/forgot-password")}
          onSignUp={() => router.push("/(auth)/sign-up")}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: "#0A0A0C",
  },
});
