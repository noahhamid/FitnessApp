import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";

type Props = Omit<TextInputProps, "secureTextEntry"> & {
  value: string;
  onChangeText: (text: string) => void;
};

/**
 * Password field with show/hide toggle.
 * Open eye = password visible; closed eye (EyeOff) = hidden again.
 */
export function PasswordInput({ value, onChangeText, style, ...rest }: Props) {
  const { C, styles: s } = useOnboardingStyles(makeStyles);
  const [visible, setVisible] = useState(false);

  return (
    <View style={s.wrap}>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        placeholderTextColor={C.muted}
        selectionColor={C.accent}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        style={[s.input, style]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        hitSlop={8}
        style={({ pressed }) => [s.eyeBtn, pressed && s.pressed]}
        onPress={() => setVisible((v) => !v)}
      >
        {visible ? (
          <EyeOff size={20} color={C.muted} strokeWidth={2} />
        ) : (
          <Eye size={20} color={C.muted} strokeWidth={2} />
        )}
      </Pressable>
    </View>
  );
}

function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
    wrap: {
      position: "relative",
      justifyContent: "center",
    },
    input: {
      backgroundColor: C.card,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: C.border,
      paddingHorizontal: 18,
      paddingVertical: 16,
      paddingRight: 52,
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: C.text,
    },
    eyeBtn: {
      position: "absolute",
      right: 14,
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: {
      opacity: 0.7,
    },
  });
}
