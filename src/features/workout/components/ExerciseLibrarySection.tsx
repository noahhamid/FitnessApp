import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { CategoryFilter } from "./CategoryFilter";
import { useExerciseLibrary } from "../hooks/useExerciseLibrary";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import {
  formatMuscleGroup,
  formatMovementPattern,
} from "../lib/muscle-icons";
import { imageForMuscleGroup } from "@/src/lib/workout-plan-adapter";

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
  onView: (exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    movementPattern: string;
    minEquipment: string;
  }) => void;
}

export function ExerciseLibrarySection({ onView }: Props) {
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
      <Text style={s.sectionSub}>Tap an exercise for details</Text>

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
          const meta = `${formatMuscleGroup(ex.muscleGroup)} · ${formatMovementPattern(ex.movementPattern)}`;
          return (
            <Pressable
              key={ex.id}
              style={({ pressed }) => [s.row, pressed && s.rowPressed]}
              onPress={() => onView(ex)}
              accessibilityRole="button"
              accessibilityLabel={`${ex.name}, ${meta}`}
            >
              <View style={s.iconWrap}>
                <Image
                  source={{ uri: imageForMuscleGroup(ex.muscleGroup) }}
                  style={s.rowIcon}
                  accessibilityIgnoresInvertColors
                />
              </View>
              <View style={s.rowMain}>
                <Text style={s.rowName} numberOfLines={1}>
                  {ex.name}
                </Text>
                <Text style={s.rowMeta} numberOfLines={1}>
                  {meta}
                </Text>
              </View>
              <ChevronRight size={18} color={T.faint} strokeWidth={2.2} />
            </Pressable>
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
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap: 12,
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 1,
    },
    rowPressed: { opacity: 0.88 },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
    },
    rowMain: { flex: 1, minWidth: 0 },
    rowName: { fontFamily: T.bodySemi, color: T.white, fontSize: 14 },
    rowMeta: {
      fontFamily: T.bodyMed,
      color: T.faint,
      fontSize: 11.5,
      marginTop: 2,
    },
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
