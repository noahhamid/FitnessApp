import React, { Fragment } from "react";
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
import { CheckCircle2, ChevronLeft, Clock, Flame, Repeat } from "lucide-react-native";
import { WorkoutPlan, Exercise } from "../data/workouts";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";

type Props = {
  plan: WorkoutPlan;
  onBack: () => void;
  onStart: () => void;
  starting?: boolean;
  /** Today's session already finished — review mode, no Start CTA. */
  completed?: boolean;
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
  completed,
  onPress,
}: {
  exercise: Exercise;
  index: number;
  completed?: boolean;
  onPress?: () => void;
}) => {
  const { T, styles: s } = useThemedStyles(makeStyles);

  return (
  <TouchableOpacity
    style={s.exRow}
    activeOpacity={onPress ? 0.75 : 1}
    disabled={!onPress}
    onPress={onPress}
    accessibilityRole={onPress ? "button" : undefined}
    accessibilityLabel={`View ${exercise.name}`}
  >
    <Text style={[s.exIndex, completed && s.exIndexDone]}>
      {completed ? "" : String(index + 1).padStart(2, "0")}
    </Text>
    {completed ? (
      <View style={s.exDoneBadge}>
        <CheckCircle2 size={16} color={T.accent} strokeWidth={2.4} />
      </View>
    ) : null}
    <Image
      source={{ uri: exercise.imageUrl }}
      style={[s.exImage, completed && s.exImageDone]}
      resizeMode="cover"
    />
    <View style={{ flex: 1 }}>
      <Text style={[s.exName, completed && s.exNameDone]}>{exercise.name}</Text>
      <Text style={s.exMeta}>
        {completed
          ? "Completed"
          : `${exercise.sets} sets · ${
              exercise.type === "reps"
                ? `${exercise.reps} reps`
                : `${exercise.durationSec}s hold`
            }`}
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
  completed = false,
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
        <View
          style={[
            s.heroWrap,
            { height: 260 + topInset(insets.top) + 52 },
          ]}
        >
          <Image
            source={{ uri: plan.coverImage }}
            style={[
              s.heroImage,
              { top: topInset(insets.top) + 52, height: 260 },
            ]}
            resizeMode="cover"
          />
          <View
            style={[
              s.heroOverlay,
              { top: topInset(insets.top) + 52, height: 260 },
            ]}
          />
          <TouchableOpacity
            style={[s.backBtn, { top: topInset(insets.top) + 60 }]}
            activeOpacity={0.8}
            onPress={onBack}
          >
            <ChevronLeft size={20} color={T.onImage} />
          </TouchableOpacity>
          <View style={s.heroTextWrap}>
            <View style={s.tagPill}>
              <Text style={s.tagText}>
                {completed ? `Done · ${plan.tag}` : plan.tag}
              </Text>
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

        <Text style={s.sectionTitle}>
          {completed ? "Completed exercises" : "Exercises"}
        </Text>
        <View style={s.exList}>
          {plan.exercises.map((ex, i) => {
            const prev = i > 0 ? plan.exercises[i - 1] : undefined;
            const showBlockHeading =
              !!ex.blockLabel && ex.blockLabel !== prev?.blockLabel;
            return (
              <Fragment key={ex.id}>
                {showBlockHeading ? (
                  <Text style={s.blockTitle}>{ex.blockLabel}</Text>
                ) : null}
                <ExerciseRow
                  exercise={ex}
                  index={i}
                  completed={completed}
                  onPress={
                    onExercisePress ? () => onExercisePress(ex) : undefined
                  }
                />
              </Fragment>
            );
          })}
        </View>
      </ScrollView>

      <View style={[s.startBar, { bottom: Math.max(insets.bottom, 8) + 16 }]}>
        {completed ? (
          <View style={s.doneBtn}>
            <CheckCircle2 size={16} color={T.accent} strokeWidth={2.6} />
            <Text style={s.doneBtnText}>Workout completed</Text>
          </View>
        ) : (
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
        )}
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scrollContent: { paddingBottom: 120 },

  heroWrap: { position: "relative", backgroundColor: T.bg },
  heroImage: { position: "absolute", left: 0, right: 0, width: "100%" },
  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
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
    backgroundColor: T.onImageGlass,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: T.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: T.onImage,
  },
  heroTitle: {
    fontFamily: T.displayBold,
    fontSize: 28,
    color: T.onImage,
    letterSpacing: -0.5,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  statChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: T.bgElevated,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.glassBorder,
  },
  statValue: {
    fontFamily: T.bodySemi,
    fontSize: 12.5,
    color: T.white,
  },

  sectionTitle: {
    fontFamily: T.displaySemi,
    fontSize: 16,
    color: T.white,
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  blockTitle: {
    fontFamily: T.bodyBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: T.muted,
    marginBottom: 6,
    marginTop: 4,
  },
  exList: { paddingHorizontal: 20, gap: 8 },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.bgElevated,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.glassBorder,
  },
  exIndex: {
    fontFamily: T.bodyBold,
    fontSize: 12,
    color: T.muted,
    width: 22,
  },
  exIndexDone: { width: 0 },
  exDoneBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.accentTint,
  },
  exImage: { width: 48, height: 48, borderRadius: 10 },
  exImageDone: { opacity: 0.85 },
  exName: {
    fontFamily: T.bodySemi,
    fontSize: 14,
    color: T.white,
  },
  exNameDone: { color: T.white },
  exMeta: {
    fontFamily: T.body,
    fontSize: 12,
    color: T.muted,
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
  },
  startBtnDisabled: { opacity: 0.7 },
  startBtnText: {
    fontFamily: T.bodyBold,
    fontSize: 15,
    color: T.onAccent,
  },
  startingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  doneBtn: {
    backgroundColor: T.accentTint,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: T.accent,
  },
  doneBtnText: {
    fontFamily: T.bodyBold,
    fontSize: 15,
    color: T.accent,
  },
  });
}
