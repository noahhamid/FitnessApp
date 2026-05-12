import { useState, type ReactNode } from "react";
import { TouchableOpacity, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { C, FONTS } from "@/src/ui/tokens";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  outline?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ children, onPress, outline = false, disabled = false, style }: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={0.85}
      style={[
        s.btn,
        outline ? s.outline : s.filled,
        disabled && s.disabled,
        pressed && s.pressed,
        style,
      ]}
    >
      <Text style={[s.text, outline ? s.textOutline : s.textFilled, disabled && s.textDisabled]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: { backgroundColor: C.accent },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: C.border },
  disabled: { backgroundColor: C.muted2 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  text: { fontFamily: FONTS.bold, fontSize: 18, letterSpacing: 0.8 },
  textFilled: { color: C.bg },
  textOutline: { color: C.text },
  textDisabled: { color: C.muted },
});
