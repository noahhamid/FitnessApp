import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ── Correct imports — NOT from @/src/theme ───────────────────────────────────
import {
  WORKOUT_HISTORY,
  WORKOUT_TEMPLATES,
} from "@/src/features/workout/services/workout.service";
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";

import ExerciseCard from "@/src/features/workout/components/ExerciseCard";
import HistoryCard from "@/src/features/workout/components/HistoryCard";
import LibrarySheet from "@/src/features/workout/components/LibrarySheet";
import ProgressPhotoSection from "@/src/features/workout/components/ProgressPhotoSection";
import TimerModal from "@/src/features/workout/components/TimerModal";
import WorkoutHeader from "@/src/features/workout/components/WorkoutHeader";

// ── Types ─────────────────────────────────────────────────────────────────────

type Exercise = {
  id: string;
  name: string;
  muscle: string;
  tag: string;
  uid: string;
};

type Template = {
  id: string;
  name: string;
  tag: string; // e.g. "Chest · Shoulders · Triceps"
  icon: string;
};

type HistorySession = {
  id: string;
  date: string;
  name: string;
  duration: string;
  volume: string;
  sets: number;
  exercises: string[];
};

// ─── Animated Template Row ────────────────────────────────────────────────────

function TemplateRow({
  tpl,
  index,
  onPress,
}: {
  tpl: Template;
  index: number;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  // Subtle accent stripe grows slightly per row
  const accentW = 3 + index * 0.5;

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 10 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={s.templateRow}
      >
        <View style={[s.templateStripe, { width: accentW }]} />
        <View style={s.templateContent}>
          <Text style={s.templateName}>{tpl.name}</Text>
          {/* Fixed: was using tpl.exercises (undefined) — now shows tpl.tag */}
          <Text style={s.templateMeta}>{tpl.tag}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={COLORS.muted}
          style={{ paddingRight: 16, opacity: 0.5 }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.tabBtn, active && s.tabBtnActive]}
      activeOpacity={0.8}
    >
      {active && <View style={s.tabBtnIndicator} />}
      <Text style={[s.tabBtnText, active && s.tabBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyExercises({ onAdd }: { onAdd: () => void }) {
  return (
    <TouchableOpacity onPress={onAdd} style={s.emptyCard} activeOpacity={0.8}>
      <View style={s.emptyIconWrap}>
        <Ionicons name="add" size={28} color={COLORS.accent} />
      </View>
      <Text style={s.emptyTitle}>NO EXERCISES YET</Text>
      <Text style={s.emptyHint}>Tap to add your first exercise</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WorkoutScreen() {
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [workoutName, setWorkoutName] = useState("Upper Body");
  const [startTime, setStartTime] = useState<number | null>(null);
  // Fixed: was any[] — now properly typed
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
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
          setStartTime(null);
        },
      },
    ]);

  // Fixed: typed properly, uid generated cleanly
  const addExercise = (ex: Omit<Exercise, "uid">) =>
    setExercises((prev) => [...prev, { ...ex, uid: `${ex.id}_${Date.now()}` }]);

  const removeExercise = (uid: string) =>
    setExercises((prev) => prev.filter((e) => e.uid !== uid));

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {activeWorkout && startTime != null && (
        <WorkoutHeader
          startTime={startTime}
          name={workoutName}
          onFinish={finishWorkout}
        />
      )}

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: activeWorkout ? 8 : 0 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Idle page header ── */}
        {!activeWorkout && (
          <View style={s.pageHeader}>
            <TouchableOpacity
              onPress={() => router.push("/(app)/(tabs)")}
              activeOpacity={0.7}
              style={s.backBtn}
            >
              <Ionicons name="arrow-back" size={14} color={COLORS.text} />
              <Text style={s.backBtnText}>Home</Text>
            </TouchableOpacity>

            <View style={s.pageTitleBlock}>
              <Text style={s.pageTitle}>WORKOUT</Text>
              <View style={s.pageTitleUnderline} />
            </View>
            <Text style={s.pageSubtitle}>LOG YOUR GAINS</Text>
          </View>
        )}

        {/* ── Workout name editor (active session) ── */}
        {activeWorkout && (
          <View style={s.nameRow}>
            {editingName ? (
              <TextInput
                value={workoutName}
                onChangeText={setWorkoutName}
                onBlur={() => setEditingName(false)}
                autoFocus
                style={s.nameInput}
                placeholderTextColor={COLORS.muted}
              />
            ) : (
              <TouchableOpacity
                onPress={() => setEditingName(true)}
                style={s.nameEditTouchable}
                activeOpacity={0.7}
              >
                <Text style={s.nameEditText}>{workoutName.toUpperCase()}</Text>
                <View style={s.editBadge}>
                  <Ionicons name="pencil" size={9} color={COLORS.muted} />
                  <Text style={s.editBadgeText}>RENAME</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Exercise list ── */}
        {activeWorkout && (
          <View style={s.section}>
            {exercises.length === 0 ? (
              <EmptyExercises onAdd={() => setShowLibrary(true)} />
            ) : (
              exercises.map((ex) => (
                <ExerciseCard
                  key={ex.uid}
                  exercise={ex}
                  onRemove={() => removeExercise(ex.uid)}
                  onTimerOpen={() => setShowTimer(true)}
                />
              ))
            )}
          </View>
        )}

        {/* ── Active workout action bar ── */}
        {activeWorkout && (
          <View style={s.actionBar}>
            <TouchableOpacity
              onPress={() => setShowLibrary(true)}
              style={s.addExBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color={COLORS.accent} />
              <Text style={s.addExBtnText}>ADD EXERCISE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimer(true)}
              style={s.timerBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="timer-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Templates (idle only) ── */}
        {!activeWorkout && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>QUICK START</Text>
            {/* Fixed: WORKOUT_TEMPLATES now typed — .map works correctly */}
            {(WORKOUT_TEMPLATES as Template[]).map((tpl, i) => (
              <TemplateRow
                key={tpl.id}
                tpl={tpl}
                index={i}
                onPress={() => startWorkout(tpl.name)}
              />
            ))}

            <TouchableOpacity
              onPress={() => startWorkout("My Workout")}
              style={s.blankBtn}
              activeOpacity={0.85}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={COLORS.muted}
              />
              <Text style={s.blankBtnText}>START BLANK WORKOUT</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── History / Photos tabs ── */}
        <View style={s.section}>
          <View style={s.tabRow}>
            <TabButton
              label="HISTORY"
              active={!showPhotos}
              onPress={() => setShowPhotos(false)}
            />
            <TabButton
              label="PHOTOS"
              active={showPhotos}
              onPress={() => setShowPhotos(true)}
            />
          </View>
        </View>

        {!showPhotos && (
          <View style={s.section}>
            {/* Fixed: WORKOUT_HISTORY typed — .map works correctly */}
            {(WORKOUT_HISTORY as HistorySession[]).length === 0 ? (
              <Text style={s.emptyHint}>No sessions logged yet.</Text>
            ) : (
              (WORKOUT_HISTORY as HistorySession[]).map((h) => (
                <HistoryCard key={h.id} session={h} />
              ))
            )}
          </View>
        )}

        {showPhotos && <ProgressPhotoSection />}

        <View style={{ height: 40 }} />
      </ScrollView>

      <LibrarySheet
        visible={showLibrary}
        onClose={() => setShowLibrary(false)}
        onAdd={addExercise}
      />
      <TimerModal visible={showTimer} onClose={() => setShowTimer(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 110 },

  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  pageTitleBlock: { marginBottom: 4 },
  pageTitle: {
    fontFamily: FONTS.black,
    fontSize: 52,
    color: COLORS.text,
    lineHeight: 50,
    letterSpacing: -0.5,
  },
  pageTitleUnderline: {
    height: 3,
    width: 48,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginTop: 4,
  },
  pageSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 3,
    marginTop: 6,
    marginBottom: 4,
  },

  nameRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  nameEditTouchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameEditText: {
    fontFamily: FONTS.black,
    fontSize: 24,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  editBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1.5,
  },
  nameInput: {
    fontFamily: FONTS.black,
    fontSize: 24,
    color: COLORS.text,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    paddingBottom: 4,
  },

  section: { paddingHorizontal: 20, paddingTop: 18 },
  sectionLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 2.5,
    marginBottom: 12,
  },

  templateRow: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  templateStripe: {
    alignSelf: "stretch",
    backgroundColor: COLORS.accent,
    opacity: 0.7,
  },
  templateContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  templateName: {
    fontFamily: FONTS.black,
    fontSize: 17,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  // Fixed: was templateMeta showing undefined — now shows tpl.tag string
  templateMeta: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  blankBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderStyle: "dashed",
    paddingVertical: 14,
  },
  blankBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.muted,
    letterSpacing: 1.5,
  },

  actionBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  addExBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}44`,
    borderRadius: 14,
    paddingVertical: 15,
  },
  addExBtnText: {
    fontFamily: FONTS.black,
    fontSize: 15,
    color: COLORS.accent,
    letterSpacing: 1.2,
  },
  timerBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${COLORS.accent}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: FONTS.black,
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: 1.5,
    opacity: 0.5,
  },
  emptyHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 0.3,
  },

  tabRow: {
    flexDirection: "row",
    backgroundColor: COLORS.bg3,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  tabBtnActive: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnIndicator: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
  tabBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.muted,
    letterSpacing: 1.2,
  },
  tabBtnTextActive: { color: COLORS.accent },
});
