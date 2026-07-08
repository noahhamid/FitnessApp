import { Modal, StyleSheet, View } from "react-native";
import { RestTimer } from "./RestTimer";

type Props = {
  visible: boolean;
  seconds: number;
  nextUpLabel?: string;
  onDone: () => void;
};

export default function RestTimerOverlay({
  visible,
  seconds,
  nextUpLabel,
  onDone,
}: Props) {
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDone}
    >
      <View style={s.backdrop}>
        <RestTimer
          seconds={seconds}
          nextUpLabel={nextUpLabel}
          onComplete={onDone}
          onSkip={onDone}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
  },
});
