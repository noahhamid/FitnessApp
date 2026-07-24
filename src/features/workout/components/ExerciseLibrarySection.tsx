import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Plus, Check } from "lucide-react-native";
import { CategoryFilter } from "./CategoryFilter";
import { useExerciseLibrary } from "../hooks/useExerciseLibrary";

const T = {
  card: "#1C1F26",
  text: "#FFFFFF",
  faint: "#9AA0AE",
  accent: "#FFC700",
  accentText: "#1A1300",
  display: "SpaceGrotesk_700Bold",
  bodySemi: "Inter_600SemiBold",
};

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
  onView: (exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    movementPattern: string;
    minEquipment: string;
  }) => void;
}

export function ExerciseLibrarySection({ addedIds, onAdd, onView }: Props) {
  const [category, setCategory] = useState("All");
  const muscleGroup = toApiMuscleGroup(category);
  const { data: exercises, isLoading } = useExerciseLibrary(muscleGroup);

  return (
    <View style={s.wrap}>
      <Text style={s.sectionTitle}>Browse exercises</Text>
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
        {exercises?.map((ex) => {
          const added = addedIds.has(ex.id);
          return (
            <Pressable key={ex.id} style={s.row} onPress={() => onView(ex)}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowName}>{ex.name}</Text>
                <Text style={s.rowMeta}>
                  {ex.muscleGroup.charAt(0).toUpperCase() +
                    ex.muscleGroup.slice(1)}
                </Text>
              </View>
              <Pressable
                style={[s.addBtn, added && s.addBtnAdded]}
                disabled={added}
                onPress={() => onAdd(ex)}
                hitSlop={8}
              >
                {added ? (
                  <Check size={16} color={T.accent} strokeWidth={2.4} />
                ) : (
                  <Plus size={16} color={T.accentText} strokeWidth={2.4} />
                )}
              </Pressable>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 32 },
  sectionTitle: {
    color: T.text,
    fontFamily: T.display,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  sectionSub: { color: T.faint, fontSize: 12, marginTop: 2, marginBottom: 16 },
  filterWrap: { marginBottom: 16 },
  loadingWrap: { paddingVertical: 24, alignItems: "center" },
  emptyText: {
    color: T.faint,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 24,
  },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.card,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  rowName: { color: T.text, fontFamily: T.bodySemi, fontSize: 14 },
  rowMeta: { color: T.faint, fontSize: 11.5, marginTop: 2 },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnAdded: {
    backgroundColor: "rgba(255,199,0,0.12)",
  },
});
