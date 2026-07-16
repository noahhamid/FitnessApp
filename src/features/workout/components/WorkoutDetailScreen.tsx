import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ChevronLeft, Clock, Flame, Repeat } from "lucide-react-native";
import { WorkoutPlan, Exercise } from "../data/workouts";

const T = {
  bg: "#000000",
  card: "#1C1F26",
  lime: "#D4F445",
  text: "#FFFFFF",
  faint: "#71717A",
  muted: "#9AA0AE",
};

type Props = {
  plan: WorkoutPlan;
  onBack: () => void;
  onStart: () => void;
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
}: {
  exercise: Exercise;
  index: number;
}) => (
  <View style={s.exRow}>
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
  </View>
);

export function WorkoutDetailScreen({ plan, onBack, onStart }: Props) {
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
            style={s.backBtn}
            activeOpacity={0.8}
            onPress={onBack}
          >
            <ChevronLeft size={20} color="#FFFFFF" />
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
            <Clock size={15} color={T.lime} />
            <Text style={s.statValue}>{minutes} min</Text>
          </View>
          <View style={s.statChip}>
            <Flame size={15} color={T.lime} />
            <Text style={s.statValue}>{estCalories} kcal</Text>
          </View>
          <View style={s.statChip}>
            <Repeat size={15} color={T.lime} />
            <Text style={s.statValue}>{plan.exercises.length} exercises</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Exercises</Text>
        <View style={s.exList}>
          {plan.exercises.map((ex, i) => (
            <ExerciseRow key={ex.id} exercise={ex} index={i} />
          ))}
        </View>
      </ScrollView>

      <View style={s.startBar}>
        <TouchableOpacity
          style={s.startBtn}
          activeOpacity={0.9}
          onPress={onStart}
        >
          <Text style={s.startBtnText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scrollContent: { paddingBottom: 120 },

  heroWrap: { height: 260, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backBtn: {
    position: "absolute",
    top: 54,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
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
    backgroundColor: T.lime,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  tagText: { color: "#121400", fontSize: 11, fontWeight: "800" },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800" },

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
    backgroundColor: T.card,
    borderRadius: 16,
    paddingVertical: 12,
  },
  statValue: { color: T.text, fontSize: 12, fontWeight: "700" },

  sectionTitle: {
    color: T.text,
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  exList: { paddingHorizontal: 20, gap: 12 },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.card,
    borderRadius: 18,
    padding: 10,
    gap: 12,
  },
  exIndex: { color: T.faint, fontSize: 12, fontWeight: "700", width: 18 },
  exImage: { width: 52, height: 52, borderRadius: 12 },
  exName: { color: T.text, fontSize: 14, fontWeight: "700" },
  exMeta: { color: T.muted, fontSize: 12, marginTop: 2 },

  startBar: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
  },
  startBtn: {
    backgroundColor: T.lime,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  startBtnText: { color: "#121400", fontSize: 15, fontWeight: "800" },
});
