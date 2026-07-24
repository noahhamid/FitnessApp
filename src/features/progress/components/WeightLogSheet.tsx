import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Minus, Plus, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const T = {
  bg: "#000000",
  panel: "#15161C",
  panelBorder: "rgba(255,255,255,0.10)",
  glass: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.10)",
  accent: "#FFC700",
  accentText: "#1A1300",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
};

interface Props {
  visible: boolean;
  initialWeight: number;
  saving?: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
}

export function WeightLogSheet({
  visible,
  initialWeight,
  saving,
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(400)).current;
  const [weight, setWeight] = useState(initialWeight);

  useEffect(() => {
    if (visible) {
      setWeight(initialWeight);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(400);
    }
  }, [visible, initialWeight]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: 400,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(onClose);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={s.backdrop} onPress={handleClose} />

        <Animated.View
          style={[
            s.sheet,
            { paddingBottom: insets.bottom + 20, transform: [{ translateY }] },
          ]}
        >
          <View style={s.handle} />

          <View style={s.headerRow}>
            <Text style={s.title}>Log weight</Text>
            <Pressable onPress={handleClose} hitSlop={8} style={s.closeBtn}>
              <X size={16} color={T.muted} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View style={s.stepperRow}>
            <Pressable
              style={s.stepperBtn}
              onPress={() =>
                setWeight((w) => Math.max(0, Math.round((w - 0.5) * 10) / 10))
              }
              hitSlop={10}
            >
              <Minus size={18} color={T.white} strokeWidth={2.4} />
            </Pressable>

            <View style={s.valueWrap}>
              <TextInput
                style={s.valueInput}
                value={String(weight)}
                keyboardType="decimal-pad"
                onChangeText={(t) => {
                  const n = parseFloat(t.replace(/[^0-9.]/g, ""));
                  setWeight(isNaN(n) ? 0 : n);
                }}
                selectTextOnFocus
              />
              <Text style={s.unit}>kg</Text>
            </View>

            <Pressable
              style={s.stepperBtn}
              onPress={() => setWeight((w) => Math.round((w + 0.5) * 10) / 10)}
              hitSlop={10}
            >
              <Plus size={18} color={T.white} strokeWidth={2.4} />
            </Pressable>
          </View>

          <Pressable
            style={[s.saveBtn, saving && s.saveBtnDisabled]}
            onPress={() => onSave(weight)}
            disabled={saving}
          >
            <Text style={s.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: T.panel,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: T.panelBorder,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontFamily: T.display,
    fontSize: 18,
    color: T.white,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 28,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  valueWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    minWidth: 100,
    justifyContent: "center",
  },
  valueInput: {
    fontFamily: T.display,
    fontSize: 44,
    color: T.white,
    textAlign: "center",
    padding: 0,
    minWidth: 80,
  },
  unit: { fontFamily: T.bodyMed, fontSize: 16, color: T.muted },
  saveBtn: {
    backgroundColor: T.accent,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontFamily: T.bodySemi,
    fontWeight: "700",
    fontSize: 14.5,
    color: T.accentText,
  },
});
