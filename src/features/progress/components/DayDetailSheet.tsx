import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { WorkoutSessionSummary } from "../hooks/useProgress";

const T = {
  panel: "#15161C",
  panelBorder: "rgba(255,255,255,0.10)",
  glass: "rgba(255,255,255,0.06)",
  accent: "#FFC700",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.55)",
  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
};

interface Props {
  visible: boolean;
  dateLabel: string;
  sessions: WorkoutSessionSummary[];
  onClose: () => void;
}

export function DayDetailSheet({
  visible,
  dateLabel,
  sessions,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(400);
    }
  }, [visible]);

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
      <Pressable style={s.backdrop} onPress={handleClose} />
      <Animated.View
        style={[
          s.sheet,
          { paddingBottom: insets.bottom + 20, transform: [{ translateY }] },
        ]}
      >
        <View style={s.handle} />
        <View style={s.headerRow}>
          <Text style={s.title}>{dateLabel}</Text>
          <Pressable onPress={handleClose} hitSlop={8} style={s.closeBtn}>
            <X size={16} color={T.muted} strokeWidth={2.2} />
          </Pressable>
        </View>

        <ScrollView
          style={{ maxHeight: 400 }}
          showsVerticalScrollIndicator={false}
        >
          {sessions.map((session) => (
            <View key={session.id} style={s.sessionBlock}>
              {session.notes && (
                <Text style={s.sessionNotes}>{session.notes}</Text>
              )}
              {session.exercises.map((ex, i) => {
                const sets =
                  (ex.sets as Array<{
                    weight?: number;
                    reps?: number;
                    completed?: boolean;
                  }>) ?? [];
                const completedSets = sets.filter((st) => st.completed);
                return (
                  <View key={i} style={s.exRow}>
                    <Text style={s.exName}>{ex.exerciseName}</Text>
                    <Text style={s.exMeta}>
                      {completedSets.length}{" "}
                      {completedSets.length === 1 ? "set" : "sets"}
                      {completedSets.length > 0 &&
                        completedSets[completedSets.length - 1].weight !=
                          null &&
                        ` · ${completedSets[completedSets.length - 1].weight}kg`}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}

          {sessions.length === 0 && (
            <Text style={s.emptyText}>No workout logged this day.</Text>
          )}
        </ScrollView>
      </Animated.View>
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
    marginBottom: 20,
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
  sessionBlock: { marginBottom: 16 },
  sessionNotes: {
    fontFamily: T.bodySemi,
    fontSize: 13,
    color: T.accent,
    marginBottom: 10,
  },
  exRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  exName: { fontFamily: T.bodyMed, fontSize: 13, color: T.white },
  exMeta: { fontFamily: T.bodyMed, fontSize: 12, color: T.muted },
  emptyText: {
    fontFamily: T.bodyMed,
    fontSize: 13,
    color: T.muted,
    textAlign: "center",
    paddingVertical: 20,
  },
});
