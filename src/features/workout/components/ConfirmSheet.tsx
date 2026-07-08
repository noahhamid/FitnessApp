import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Design Tokens — "Muscle Monster" Theme ─────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E",
  bg3: "#282828",
  gold: "#FFC700",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

export default function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "CANCEL",
  onConfirm,
  onCancel,
  destructive = true,
}: Props) {
  const sheetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(sheetAnim, {
        toValue: 1,
        damping: 22,
        stiffness: 260,
        useNativeDriver: true,
      }).start();
    } else {
      sheetAnim.setValue(0);
    }
  }, [visible]);

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={s.overlay} onPress={onCancel}>
        <Animated.View
          style={[
            s.backdrop,
            {
              opacity: sheetAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        />
      </Pressable>

      <Animated.View
        style={[s.sheet, { transform: [{ translateY: sheetTranslate }] }]}
      >
        <View style={s.handleRow}>
          <View style={s.handle} />
        </View>

        <Text style={s.title}>{title}</Text>
        <Text style={s.message}>{message}</Text>

        <TouchableOpacity
          onPress={onConfirm}
          style={[s.confirmBtn, !destructive && s.confirmBtnNeutral]}
          activeOpacity={0.85}
        >
          <Text style={s.confirmText}>{confirmLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCancel}
          style={s.cancelBtn}
          activeOpacity={0.7}
        >
          <Text style={s.cancelText}>{cancelLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: T.bg2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },

  handleRow: { alignItems: "center", paddingTop: 12, paddingBottom: 8 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.bg3,
  },

  title: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 22,
    color: T.text,
    letterSpacing: 0.5,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  message: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.sub,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  confirmBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  confirmBtnNeutral: {
    backgroundColor: T.gold,
  },
  confirmText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
    color: T.bg0,
    letterSpacing: 2,
  },

  cancelBtn: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.sub,
    letterSpacing: 1.5,
  },
});
