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
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import type { WorkoutSessionSummary } from "../hooks/useProgress";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

interface Props {
  visible: boolean;
  dateLabel: string;
  sessions: WorkoutSessionSummary[];
  onClose: () => void;
}

function DayDetailSheetBody({
  visible,
  dateLabel,
  sessions,
  onClose,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
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
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: 400,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(onClose);
  };

  return (
    <>
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
              {session.exercises.map((ex) => {
                const sets =
                  (ex.sets as {
                    weight?: number;
                    reps?: number;
                    completed?: boolean;
                  }[]) ?? [];
                const completedSets = sets.filter((st) => st.completed);
                return (
                  <View key={ex.id} style={s.exRow}>
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
    </>
  );
}

export function DayDetailSheet(props: Props) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.onClose}
      statusBarTranslucent
    >
      <SafeAreaProvider>
        <DayDetailSheetBody {...props} />
      </SafeAreaProvider>
    </Modal>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(10,10,10,0.55)" },
    sheet: {
      backgroundColor: T.bgElevated,
      borderTopLeftRadius: T.radius.xl,
      borderTopRightRadius: T.radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
      paddingHorizontal: T.space.xl,
      paddingTop: T.space.md,
      overflow: "hidden",
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
      flex: 1,
      paddingRight: T.space.sm,
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
    sessionBlock: { marginBottom: T.space.lg },
    sessionNotes: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.accent,
      marginBottom: 10,
    },
    exRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: T.space.sm,
      borderBottomWidth: 0.5,
      borderBottomColor: T.glassBorder,
    },
    exName: { fontFamily: T.bodyMed, fontSize: 13, color: T.white },
    exMeta: { fontFamily: T.bodyMed, fontSize: 12, color: T.muted },
    emptyText: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.muted,
      textAlign: "center",
      paddingVertical: T.space.xl,
    },
  });
}
