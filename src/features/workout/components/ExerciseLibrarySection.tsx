import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Plus, Check, ChevronDown } from "lucide-react-native";
import { CategoryFilter } from "./CategoryFilter";
import { useExerciseLibrary } from "../hooks/useExerciseLibrary";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

const MUSCLE_GROUP_CATEGORIES = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Biceps",
  "Triceps",
  "Core",
];

const PAGE_SIZE = 6;

function toApiMuscleGroup(category: string): string | undefined {
  if (category === "All") return undefined;
  return category.toLowerCase();
}

interface Props {
  addedIds: Set<string>;
  onAdd: (exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    movementPattern: string;
  }) => void;
  onRemove: (exerciseId: string) => void;
  onView: (exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    movementPattern: string;
    minEquipment: string;
  }) => void;
  /**
   * When true, an already-added row's indicator becomes a plain inert
   * badge instead of a Pressable wired to onRemove. Used by the
   * mid-workout "add exercise" modal, which has no remove-from-session
   * flow — without this, tapping an exercise that's already in the live
   * session silently no-ops (indistinguishable from "add is broken").
   */
  addedDisabled?: boolean;
  /** Disables all add buttons while a live-session add is in flight. */
  addPending?: boolean;
}

export function ExerciseLibrarySection({
  addedIds,
  onAdd,
  onRemove,
  onView,
  addedDisabled = false,
  addPending = false,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const [category, setCategory] = useState("All");
  const muscleGroup = toApiMuscleGroup(category);
  const {
    data: exercises,
    isLoading,
    isFetching,
  } = useExerciseLibrary(muscleGroup);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category]);

  const visibleExercises = useMemo(
    () => exercises?.slice(0, visibleCount) ?? [],
    [exercises, visibleCount],
  );
  const hasMore = (exercises?.length ?? 0) > visibleCount;
  const remaining = (exercises?.length ?? 0) - visibleCount;

  return (
    <View style={s.wrap}>
      <View style={s.titleRow}>
        <Text style={s.sectionTitle}>Browse exercises</Text>
        {isFetching && !isLoading && (
          <ActivityIndicator size="small" color={T.faint} />
        )}
      </View>
      <Text style={s.sectionSub}>
        Tap to view, or add extras to today's workout
      </Text>

      <View style={s.filterWrap}>
        <CategoryFilter
          categories={MUSCLE_GROUP_CATEGORIES}
          active={category}
          onChange={setCategory}
        />
      </View>

      {isLoading && (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={T.accent} />
        </View>
      )}

      {!isLoading && exercises?.length === 0 && (
        <Text style={s.emptyText}>No exercises in this category yet.</Text>
      )}

      <View style={s.list}>
        {visibleExercises.map((ex) => {
          const added = addedIds.has(ex.name);
          const rowInert = added && addedDisabled;
          // Sibling Pressables (not nested): RN does not reliably honor
          // stopPropagation on nested Pressables. One shared layout for
          // every call site (Today browse + ActiveWorkoutScreen modal).
          return (
            <View
              key={ex.id}
              style={[s.row, rowInert && s.rowInert]}
            >
              <Pressable
                style={s.rowMain}
                onPress={() => onView(ex)}
                disabled={rowInert || addPending}
              >
                <Text style={s.rowName}>{ex.name}</Text>
                <Text style={s.rowMeta}>
                  {ex.muscleGroup.charAt(0).toUpperCase() +
                    ex.muscleGroup.slice(1)}
                  {rowInert ? " · Already in this workout" : ""}
                </Text>
              </Pressable>
              {added && addedDisabled ? (
                <View
                  style={[s.addBtn, s.addBtnAdded]}
                  accessibilityLabel="Already in this workout"
                >
                  <Check size={16} color={T.accent} strokeWidth={2.4} />
                </View>
              ) : (
                <Pressable
                  style={[
                    s.addBtn,
                    added && s.addBtnAdded,
                    addPending && s.addBtnPending,
                  ]}
                  onPress={() => {
                    if (addPending) return;
                    if (added) {
                      onRemove(ex.name);
                    } else {
                      onAdd(ex);
                    }
                  }}
                  disabled={addPending}
                  hitSlop={8}
                >
                  {added ? (
                    <Check size={16} color={T.accent} strokeWidth={2.4} />
                  ) : (
                    <Plus size={16} color={T.onAccent} strokeWidth={2.4} />
                  )}
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      {hasMore && (
        <Pressable
          style={s.seeMoreBtn}
          onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}
          hitSlop={8}
        >
          <Text style={s.seeMoreText}>
            See {Math.min(remaining, PAGE_SIZE)} more
          </Text>
          <ChevronDown size={14} color={T.accent} strokeWidth={2.4} />
        </Pressable>
      )}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
  wrap: { marginTop: 32 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: {
    fontFamily: T.displayBold,
    color: T.white,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontFamily: T.bodyMed,
    color: T.faint,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  filterWrap: { marginBottom: 16 },
  loadingWrap: { paddingVertical: 24, alignItems: "center" },
  emptyText: {
    fontFamily: T.bodyMed,
    color: T.faint,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 24,
  },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bgElevated,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  rowMain: { flex: 1 },
  rowInert: { opacity: 0.55 },
  rowName: { fontFamily: T.bodySemi, color: T.white, fontSize: 14 },
  rowMeta: {
    fontFamily: T.bodyMed,
    color: T.faint,
    fontSize: 11.5,
    marginTop: 2,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnAdded: { backgroundColor: T.accentTint },
  addBtnPending: { opacity: 0.5 },
  seeMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 14,
    marginTop: 4,
  },
  seeMoreText: {
    fontFamily: T.display,
    color: T.accent,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  });
}
