import { Modal, View, Pressable, StyleSheet } from "react-native";
import { COLORS } from "@/src/ui/tokens";
import type { ReactNode } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

/** Minimal modal sheet — replace with @gorhom/bottom-sheet when you add it */
export function BottomSheet({ visible, onClose, children }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.sheet}>{children}</View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000000aa" },
  sheet: {
    backgroundColor: COLORS.bg2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: "40%",
  },
});
