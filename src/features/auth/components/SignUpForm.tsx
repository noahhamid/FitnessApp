import { C } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { Button } from "@/src/ui/components/Button";
import { Input } from "@/src/ui/components/Input";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSignUp } from "../hooks/useAuth";

type Props = {
  onSuccess: () => void;
};

export function SignUpForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutateAsync: signUp, isPending, error } = useSignUp();

  async function handleSubmit() {
    if (!email || !password) return;
    await signUp({ email, password });
    onSuccess();
  }

  const passwordTooShort = password.length > 0 && password.length < 8;

  return (
    <View style={s.wrap}>
      <Text style={s.title}>CREATE ACCOUNT</Text>

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
        placeholder="Min. 8 characters"
        secureTextEntry
      />

      {passwordTooShort && (
        <Text style={s.hintText}>Password must be at least 8 characters.</Text>
      )}

      {error && (
        <Text style={s.errorText}>
          {(error as Error).message ?? "Sign up failed. Please try again."}
        </Text>
      )}

      <Button
        onPress={handleSubmit}
        disabled={!email || password.length < 8 || isPending}
        style={{ marginTop: 8 }}
      >
        {isPending ? <ActivityIndicator color={C.bg} /> : "SIGN UP"}
      </Button>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 24, gap: 4 },
  title: {
    fontFamily: FONTS.black,
    fontSize: 32,
    color: C.text,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  hintText: {
    color: C.muted,
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
});
