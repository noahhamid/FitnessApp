import { C, FONTS } from "@/src/ui/tokens";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
}: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.wrap}>
      {label ? <Text style={s.label}>{label.toUpperCase()}</Text> : null}
      <View style={[s.box, focused && s.boxFocused]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={s.text}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg3,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    // Fixed: explicit minHeight prevents Android collapse
    minHeight: 52,
  },
  boxFocused: { borderColor: `${C.accent}99` },
  text: {
    flex: 1,
    color: C.text,
    fontSize: 16,
    paddingVertical: 15,
    fontFamily: FONTS.regular,
  },
});
