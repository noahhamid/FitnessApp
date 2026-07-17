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
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: { backgroundColor: C.accent },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: C.border,
  },
  disabled: { backgroundColor: C.bg3, borderWidth: 1.5, borderColor: C.border },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  textFilled: { color: "#FFFFFF" },
  textOutline: { color: C.text },
  textDisabled: { color: C.muted },
});
