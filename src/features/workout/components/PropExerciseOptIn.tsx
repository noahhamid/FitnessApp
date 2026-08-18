import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ChevronDown, ChevronRight, Plus } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { useWorkoutPlan } from "../hooks/useWorkoutPlan";
import {
  useExerciseLibrary,
  type LibraryExercise,
} from "../hooks/useExerciseLibrary";
import { formatMuscleGroup } from "../lib/muscle-icons";

type Props = {
  /** Muscle groups already in today's session — keeps the list relevant. */
  muscleGroups: string[];
  /** Names already in the session, so nothing is offered twice. */
  alreadyAdded: Set<string>;
  onAdd: (exercise: LibraryExercise) => void;
  disabled?: boolean;
};

/**
 * Bodyweight plans are generated floor-only, so anything needing a bench, bar
 * or wall never appears. This offers those moves back for the days when the
 * furniture actually is there.
 */
export function PropExerciseOptIn({
  muscleGroups,
  alreadyAdded,
  onAdd,
  disabled,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const [expanded, setExpanded] = useState(false);
  const { data: apiPlan } = useWorkoutPlan();
  const isBodyweight = apiPlan?.equipment === "bodyweight";

  const { data: propExercises, isLoading } = useExerciseLibrary(undefined, {
    needsProp: true,
    enabled: expanded && isBodyweight,
  });

  const relevant = useMemo(() => {
    if (!propExercises) return [];
    const groups = new Set(muscleGroups.map((g) => g.toLowerCase()));
    return propExercises.filter(
      (ex) =>
        groups.has(ex.muscleGroup.toLowerCase()) && !alreadyAdded.has(ex.name),
    );
  }, [propExercises, muscleGroups, alreadyAdded]);

  if (!isBodyweight) return null;

  return (
    <View style={s.wrap}>
      <Pressable
        style={s.header}
        onPress={() => setExpanded((v) => !v)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Show exercises that need equipment"
      >
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Got a bench, bar or wall?</Text>
          <Text style={s.sub}>Add a move that needs one</Text>
        </View>
        {expanded ? (
          <ChevronDown size={16} color={T.accentOnDark} strokeWidth={2.4} />
        ) : (
          <ChevronRight size={16} color={T.accentOnDark} strokeWidth={2.4} />
        )}
      </Pressable>

      {expanded && (
        <View style={s.list}>
          {isLoading && (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="small" color={T.accentOnDark} />
            </View>
          )}

          {!isLoading && relevant.length === 0 && (
            <Text style={s.emptyText}>
              Nothing extra for today&apos;s muscle groups.
            </Text>
          )}

          {relevant.map((ex) => (
            <Pressable
              key={ex.id}
              style={[s.row, disabled && s.rowDisabled]}
              disabled={disabled}
              onPress={() => onAdd(ex)}
              accessibilityRole="button"
              accessibilityLabel={`Add ${ex.name}`}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.rowName} numberOfLines={1}>
                  {ex.name}
                </Text>
                <Text style={s.rowMeta}>
                  {formatMuscleGroup(ex.muscleGroup)}
                </Text>
              </View>
              <Plus size={15} color={T.accentOnDark} strokeWidth={2.6} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    wrap: {
      backgroundColor: T.darkGlass,
      borderWidth: 1,
      borderColor: T.darkGlassBorder,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 10,
    },
    header: { flexDirection: "row", alignItems: "center", gap: 10 },
    title: {
      fontFamily: T.bodyBold,
      color: T.onDark,
      fontSize: 13,
    },
    sub: {
      fontFamily: T.bodyMed,
      color: T.onDarkMuted,
      fontSize: 11,
      marginTop: 1,
    },
    list: { gap: 8 },
    loadingWrap: { paddingVertical: 12, alignItems: "center" },
    emptyText: {
      fontFamily: T.bodyMed,
      color: T.onDarkMuted,
      fontSize: 11,
      paddingVertical: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: T.darkPanel,
      borderWidth: 1,
      borderColor: T.darkPanelBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    rowDisabled: { opacity: 0.45 },
    rowName: {
      fontFamily: T.bodySemi,
      color: T.onDark,
      fontSize: 13,
    },
    rowMeta: {
      fontFamily: T.bodyMed,
      color: T.onDarkMuted,
      fontSize: 11,
      marginTop: 1,
    },
  });
}
