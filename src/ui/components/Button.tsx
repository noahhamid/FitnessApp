import { C, FONTS } from "@/src/ui/tokens";
import { useState, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  outline?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  children,
  onPress,
  outline = false,
  disabled = false,
  style,
}: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={1}
      style={[
        s.btn,
        outline ? s.outline : s.filled,
        disabled && s.disabled,
        pressed && s.pressed,
        style,
      ]}
    >
      <Text
        style={[
          s.text,
          outline ? s.textOutline : s.textFilled,
          disabled && s.textDisabled,
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: { backgroundColor: C.accent },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: C.border,
  },
  // Fixed: was muted2 which may not exist — use explicit fallback
  disabled: { backgroundColor: C.bg3, borderWidth: 1.5, borderColor: C.border },
  pressed: { opacity: 0.84, transform: [{ scale: 0.97 }] },
  // Fixed: was 18px — too large for split-button layouts, 14px fits everywhere
  text: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 1,
  },
  textFilled: { color: C.bg },
  textOutline: { color: C.text },
  textDisabled: { color: C.muted },
});
