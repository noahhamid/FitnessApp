import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  StyleSheet,
} from "react-native";
import { COLORS, WORKOUT_HISTORY, WORKOUT_TEMPLATES } from "@/src/theme";
import TimerModal from "@/src/features/workout/components/TimerModal";
import LibrarySheet from "@/src/features/workout/components/LibrarySheet";
import ExerciseCard from "@/src/features/workout/components/ExerciseCard";
import WorkoutHeader from "@/src/features/workout/components/WorkoutHeader";
import ProgressPhotoSection from "@/src/features/workout/components/ProgressPhotoSection";
import HistoryCard from "@/src/features/workout/components/HistoryCard";

export default function WorkoutScreen() {
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [workoutName, setWorkoutName] = useState("Upper Body");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [historyTab, setHistoryTab] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const startWorkout = (name = "Upper Body") => {
    setWorkoutName(name);
    setExercises([]);
    setStartTime(Date.now());
    setActiveWorkout(true);
  };
  const finishWorkout = () =>
    Alert.alert("Finish Workout?", "Your session will be saved to history.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "FINISH",
        style: "destructive",
        onPress: () => {
          setActiveWorkout(false);
          setExercises([]);
        },
      },
    ]);
  const addExercise = (ex: any) =>
    setExercises((prev) => [...prev, { ...ex, uid: `${ex.id}_${Date.now()}` }]);
  const removeExercise = (uid: string) => setExercises((prev) => prev.filter((e) => e.uid !== uid));

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      {activeWorkout && <WorkoutHeader startTime={startTime} name={workoutName} onFinish={finishWorkout} />}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingTop: activeWorkout ? 8 : 52 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!activeWorkout && (
          <View style={s.pageHeader}>
            <TouchableOpacity onPress={() => router.push("/(app)/(tabs)")} activeOpacity={0.7} style={s.backBtn}>
              <Text style={s.backBtnText}>← Home</Text>
            </TouchableOpacity>
            <Text style={s.pageTitle}>WORKOUT</Text>
            <Text style={s.pageSubtitle}>LOG YOUR GAINS</Text>
          </View>
        )}
        {activeWorkout && (
          <View style={[s.section, { paddingTop: 0 }]}>
            {editingName ? (
              <TextInput
                value={workoutName}
                onChangeText={setWorkoutName}
                onBlur={() => setEditingName(false)}
                autoFocus
                style={s.nameInput}
              />
            ) : (
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={s.workoutEditName}>{workoutName} ✏️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {activeWorkout && exercises.length > 0 && (
          <View style={s.section}>
            {exercises.map((ex) => (
              <ExerciseCard
                key={ex.uid}
                exercise={ex}
                onRemove={() => removeExercise(ex.uid)}
                onTimerOpen={() => setShowTimer(true)}
              />
            ))}
          </View>
        )}
        {!activeWorkout ? (
          <View style={s.section}>
            {WORKOUT_TEMPLATES.map((tpl) => (
              <TouchableOpacity key={tpl.id} onPress={() => startWorkout(tpl.name)} style={s.templateRow}>
                <Text style={s.templateName}>{tpl.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={[s.section, s.activeActions]}>
            <TouchableOpacity onPress={() => setShowLibrary(true)} style={s.addExBtn}>
              <Text style={s.addExBtnText}>+ ADD EXERCISE</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTimer(true)} style={s.timerShortcut}>
              <Text style={{ fontSize: 20 }}>⏱</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={[s.section, { paddingTop: 24 }]}>
          <View style={s.tabRow}>
            <TouchableOpacity onPress={() => setHistoryTab(false)} style={[s.tabBtn, !historyTab && s.tabBtnActive]}>
              <Text style={[s.tabBtnText, !historyTab && s.tabBtnTextActive]}>HISTORY</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHistoryTab(true)} style={[s.tabBtn, historyTab && s.tabBtnActive]}>
              <Text style={[s.tabBtnText, historyTab && s.tabBtnTextActive]}>PHOTOS</Text>
            </TouchableOpacity>
          </View>
        </View>
        {!historyTab && (
          <View style={s.section}>
            {WORKOUT_HISTORY.map((h) => (
              <HistoryCard key={h.id} session={h} />
            ))}
          </View>
        )}
        {historyTab && <ProgressPhotoSection />}
      </ScrollView>
      <LibrarySheet visible={showLibrary} onClose={() => setShowLibrary(false)} onAdd={addExercise} />
      <TimerModal visible={showTimer} onClose={() => setShowTimer(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  section: { paddingHorizontal: 20, paddingTop: 18 },
  pageHeader: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: 4 },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: { fontFamily: "DMSans_600SemiBold", fontSize: 12, color: COLORS.text },
  pageTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 42,
    color: COLORS.text,
    lineHeight: 44,
  },
  pageSubtitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: COLORS.muted,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  workoutEditName: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 22,
    color: COLORS.text,
    marginBottom: 4,
  },
  nameInput: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 22,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
    paddingBottom: 4,
    marginBottom: 4,
  },
  activeActions: { flexDirection: "row", gap: 10 },
  addExBtn: {
    flex: 1,
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}40`,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  addExBtnText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 16,
    color: COLORS.accent,
    letterSpacing: 1,
  },
  timerShortcut: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  templateRow: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  templateName: { fontFamily: "BarlowCondensed_800ExtraBold", fontSize: 17, color: COLORS.text },
  tabRow: {
    flexDirection: "row",
    backgroundColor: COLORS.bg3,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  tabBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: COLORS.muted,
    letterSpacing: 0.8,
  },
  tabBtnTextActive: { color: COLORS.accent },
});
