import { View, Text, StyleSheet } from "react-native";
import { C, FONTS } from "@/src/theme";
import { Button } from "@/src/ui/components/Button";
import { Input } from "@/src/ui/components/Input";

type Props = {
  email: string;
  password: string;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => void;
};

export function SignUpForm({ email, password, onChangeEmail, onChangePassword, onSubmit }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>CREATE ACCOUNT</Text>
      <Input label="Email" value={email} onChangeText={onChangeEmail} placeholder="you@example.com" keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={onChangePassword} placeholder="Min. 8 characters" secureTextEntry />
      <Button onPress={onSubmit} style={{ marginTop: 8 }}>
        SIGN UP
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
});
