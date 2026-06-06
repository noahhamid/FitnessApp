import { C } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { Button } from "@/src/ui/components/Button";
import { Input } from "@/src/ui/components/Input";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSignIn } from "../hooks/useAuth";

type Props = {
  onSuccess: () => void;
};

export function SignInForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutateAsync: signIn, isPending, error } = useSignIn();

  async function handleSubmit() {
    if (!email || !password) return;
    await signIn({ email, password });
    onSuccess();
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>SIGN IN</Text>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
      />

      {error && (
        <Text style={s.errorText}>
          {(error as Error).message ?? "Sign in failed. Please try again."}
        </Text>
      )}

      <Button
        onPress={handleSubmit}
        disabled={!email || !password || isPending}
        style={{ marginTop: 8 }}
      >
        {isPending ? <ActivityIndicator color={C.bg} /> : "CONTINUE"}
      </Button>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 24, gap: 4 },
  title: {
    fontFamily: FONTS.black,
    fontSize: 36,
    color: C.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
});
