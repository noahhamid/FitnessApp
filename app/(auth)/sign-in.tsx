import { OAuthButtons, SignInForm } from "@/src/features/auth";
import { getPostSignInRoute } from "@/src/lib/routing";
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
        <SignInForm onSuccess={navigateAfterAuth} />
        <View style={{ paddingHorizontal: 24 }}>
          <OAuthButtons onSuccess={navigateAfterAuth} />
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
  scroll: {
    flexGrow: 1,
    paddingTop: 60,
    backgroundColor: C.bg,
    paddingBottom: 40,
  },
  footer: { padding: 24, alignItems: "center" },
  footerText: { fontFamily: FONTS.semiBold, color: C.accent },
});
