import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Clock, Flame, Repeat } from "lucide-react-native";
import { WorkoutPlan, Exercise } from "../data/workouts";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";

type Props = {
  plan: WorkoutPlan;
  onBack: () => void;
  onStart: () => void;
  starting?: boolean;
  onExercisePress?: (exercise: Exercise) => void;
};

const totalMinutesEstimate = (plan: WorkoutPlan) => {
  const seconds = plan.exercises.reduce((sum, ex) => {
    const work = ex.type === "duration" ? (ex.durationSec ?? 0) : ex.reps! * 3;
    return sum + (work + ex.restSec) * ex.sets;
  }, 0);
  return Math.round(seconds / 60);
};

const ExerciseRow = ({
  exercise,
  index,
  onPress,
}: {
  exercise: Exercise;
  index: number;
  onPress?: () => void;
}) => {
  const { styles: s } = useThemedStyles(makeStyles);

  return (
  <TouchableOpacity
    style={s.exRow}
    activeOpacity={onPress ? 0.75 : 1}
    disabled={!onPress}
    onPress={onPress}
    accessibilityRole={onPress ? "button" : undefined}
    accessibilityLabel={`View ${exercise.name}`}
  >
    <Text style={s.exIndex}>{String(index + 1).padStart(2, "0")}</Text>
    <Image
      source={{ uri: exercise.imageUrl }}
      style={s.exImage}
      resizeMode="cover"
    />
    <View style={{ flex: 1 }}>
      <Text style={s.exName}>{exercise.name}</Text>
      <Text style={s.exMeta}>
        {exercise.sets} sets ·{" "}
        {exercise.type === "reps"
          ? `${exercise.reps} reps`
          : `${exercise.durationSec}s hold`}
      </Text>
    </View>
  </TouchableOpacity>
  );
};

export function WorkoutDetailScreen({
  plan,
  onBack,
  onStart,
  starting,
  onExercisePress,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const minutes = totalMinutesEstimate(plan);
  const estCalories = Math.round(minutes * 8.5);

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <View style={s.heroWrap}>
          <Image
            source={{ uri: plan.coverImage }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <View style={s.heroOverlay} />
          <TouchableOpacity
            style={[s.backBtn, { top: topInset(insets.top) + 8 }]}
            activeOpacity={0.8}
            onPress={onBack}
          >
            <ChevronLeft size={20} color={T.onImage} />
          </TouchableOpacity>
          <View style={s.heroTextWrap}>
            <View style={s.tagPill}>
              <Text style={s.tagText}>{plan.tag}</Text>
            </View>
            <Text style={s.heroTitle}>{plan.title}</Text>
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.statChip}>
            <Clock size={15} color={T.accent} strokeWidth={2} />
            <Text style={s.statValue}>{minutes} min</Text>
          </View>
          <View style={s.statChip}>
            <Flame size={15} color={T.accent} strokeWidth={2} />
            <Text style={s.statValue}>{estCalories} kcal</Text>
          </View>
          <View style={s.statChip}>
            <Repeat size={15} color={T.accent} strokeWidth={2} />
            <Text style={s.statValue}>{plan.exercises.length} exercises</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Exercises</Text>
        <View style={s.exList}>
          {plan.exercises.map((ex, i) => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              index={i}
              onPress={
                onExercisePress ? () => onExercisePress(ex) : undefined
              }
            />
          ))}
        </View>
      </ScrollView>

      <View style={[s.startBar, { bottom: Math.max(insets.bottom, 8) + 16 }]}>
        <TouchableOpacity
          style={[s.startBtn, starting && s.startBtnDisabled]}
          activeOpacity={0.9}
          onPress={onStart}
          disabled={starting}
        >
          {starting ? (
            <View style={s.startingRow}>
              <ActivityIndicator color={T.onAccent} size="small" />
              <Text style={s.startBtnText}>Starting...</Text>
            </View>
          ) : (
            <Text style={s.startBtnText}>Start Workout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scrollContent: { paddingBottom: 120 },

  heroWrap: { height: 260, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.28)",
  },
  backBtn: {
    position: "absolute",
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.onImageGlass,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
  },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: T.accent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: T.bodyBold,
    color: T.onAccent,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontFamily: T.displayBold,
    color: T.onImage,
    fontSize: 26,
    letterSpacing: -0.4,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 24,
  },
  statChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: T.bgElevated,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    borderRadius: 16,
    paddingVertical: 12,
  },
  statValue: { fontFamily: T.bodyBold, color: T.white, fontSize: 12 },

  sectionTitle: {
    fontFamily: T.displaySemi,
    color: T.white,
    fontSize: 18,
    letterSpacing: -0.3,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  exList: { paddingHorizontal: 20, gap: 10 },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bgElevated,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    borderRadius: 16,
    padding: 10,
    gap: 12,
  },
  exIndex: {
    fontFamily: T.bodyBold,
    color: T.faint,
    fontSize: 12,
    width: 18,
    fontVariant: ["tabular-nums"],
  },
  exImage: { width: 52, height: 52, borderRadius: 12 },
  exName: { fontFamily: T.bodySemi, color: T.white, fontSize: 14 },
  exMeta: {
    fontFamily: T.bodyMed,
    color: T.muted,
    fontSize: 12,
    marginTop: 2,
  },

  startBar: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  startBtn: {
    backgroundColor: T.accent,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  startBtnDisabled: { opacity: 0.75 },
  startingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  startBtnText: { fontFamily: T.bodyBold, color: T.onAccent, fontSize: 15 },
  });
}
