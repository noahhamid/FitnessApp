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
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

interface Props {
  visible: boolean;
  /** null = no prior log; sheet starts blank rather than inventing a weight. */
  initialWeight: number | null;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (weight: number) => void;
}

function WeightLogSheetBody({
  visible,
  initialWeight,
  saving,
  error,
  onClose,
  onSave,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(400)).current;
  const [weight, setWeight] = useState<number | null>(initialWeight);

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

  const canSave = weight != null && weight > 0 && !saving;

  return (
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
              setWeight((w) =>
                w == null
                  ? null
                  : Math.max(0, Math.round((w - 0.5) * 10) / 10),
              )
            }
            hitSlop={10}
            disabled={weight == null}
          >
            <Minus size={18} color={T.white} strokeWidth={2.4} />
          </Pressable>

          <View style={s.valueWrap}>
            <TextInput
              style={s.valueInput}
              value={weight == null ? "" : String(weight)}
              placeholder="—"
              placeholderTextColor={T.muted}
              keyboardType="decimal-pad"
              onChangeText={(t) => {
                const cleaned = t.replace(/[^0-9.]/g, "");
                if (cleaned === "" || cleaned === ".") {
                  setWeight(null);
                  return;
                }
                const n = parseFloat(cleaned);
                setWeight(isNaN(n) ? null : n);
              }}
              selectTextOnFocus
            />
            <Text style={s.unit}>kg</Text>
          </View>

          <Pressable
            style={s.stepperBtn}
            onPress={() =>
              setWeight((w) =>
                w == null ? 0.5 : Math.round((w + 0.5) * 10) / 10,
              )
            }
            hitSlop={10}
          >
            <Plus size={18} color={T.white} strokeWidth={2.4} />
          </Pressable>
        </View>

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <Pressable
          style={[s.saveBtn, !canSave && s.saveBtnDisabled]}
          onPress={() => {
            if (weight != null && weight > 0) onSave(weight);
          }}
          disabled={!canSave}
        >
          <Text style={s.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
        </Pressable>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

export function WeightLogSheet(props: Props) {
  // Modal is a separate native root — nest SafeAreaProvider so insets
  // measure correctly (same pattern as ActiveWorkoutScreen library modal).
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.onClose}
      statusBarTranslucent
    >
      <SafeAreaProvider>
        <WeightLogSheetBody {...props} />
      </SafeAreaProvider>
    </Modal>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(10,10,10,0.45)" },
    sheet: {
      backgroundColor: T.glass,
      borderTopLeftRadius: T.radius.xl,
      borderTopRightRadius: T.radius.xl,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
      paddingHorizontal: T.space.xl,
      paddingTop: T.space.md,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: T.border,
      alignSelf: "center",
      marginBottom: T.space.xl,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: T.space.xl,
    },
    title: {
      fontFamily: T.displaySemi,
      fontSize: 18,
      color: T.white,
      letterSpacing: -0.3,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: T.accentTint,
      borderWidth: 0.5,
      borderColor: T.border,
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
      backgroundColor: T.accentTint,
      borderWidth: 0.5,
      borderColor: T.border,
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
      fontFamily: T.displayBold,
      fontSize: 44,
      color: T.white,
      textAlign: "center",
      padding: 0,
      minWidth: 80,
    },
    unit: { fontFamily: T.bodyMed, fontSize: 16, color: T.muted },
    saveBtn: {
      backgroundColor: T.accent,
      borderRadius: T.radius.pill,
      paddingVertical: T.space.lg,
      alignItems: "center",
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: {
      fontFamily: T.bodyBold,
      fontSize: 14.5,
      color: T.onAccent,
    },
    errorText: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.accent,
      textAlign: "center",
      marginBottom: T.space.md,
      lineHeight: 18,
    },
  });
}
