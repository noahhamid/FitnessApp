import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ProfileSubpageShell } from "@/src/features/profile/components/ProfileSubpageShell";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import {
  fetchUserProfile,
  saveUserProfile,
} from "@/src/features/profile/services/profile.service";
import {
  defaultTrainingDays,
  normalizeTrainingDays,
  WEEKDAY_LABELS_SHORT,
} from "@/src/lib/plan-day-selection";
import { workoutPlanQueryKey } from "@/src/features/workout/hooks/useWorkoutPlan";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

export default function TrainingScheduleScreen() {
  const { T, styles } = useThemedStyles(makeStyles);
  const router = useRouter();
  const qc = useQueryClient();
  const { data: profile, isPending } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });

  const scheduledDays = useMemo(
    () =>
      normalizeTrainingDays(profile?.trainingDays) ??
      defaultTrainingDays(profile?.daysPerWeek ?? 0),
    [profile?.trainingDays, profile?.daysPerWeek],
  );

  const [daysInput, setDaysInput] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDaysInput(scheduledDays);
  }, [scheduledDays]);

  const toggleTrainingDay = (index: number) => {
    setDaysInput((current) => {
      if (current.includes(index)) {
        if (current.length <= 2) return current;
        return current.filter((d) => d !== index);
      }
      return [...current, index].sort((a, b) => a - b);
    });
  };

  async function onSave() {
    if (daysInput.length < 2) {
      Alert.alert("Pick at least 2 days", "Your plan needs two or more days.");
      return;
    }
    setSaving(true);
    try {
      const changed = daysInput.join(",") !== scheduledDays.join(",");
      await saveUserProfile({ trainingDays: daysInput });
      await qc.invalidateQueries({ queryKey: ["user", "profile"] });
      if (changed) {
        await qc.invalidateQueries({ queryKey: workoutPlanQueryKey });
      }
      router.back();
    } catch (err) {
      Alert.alert(
        "Save failed",
        err instanceof Error ? err.message : "Unable to save.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileSubpageShell
      title="Training Schedule"
      subtitle="Days you train each week"
      onSave={() => void onSave()}
      saving={saving}
      saveDisabled={isPending}
    >
      {isPending ? (
        <ActivityIndicator color={T.accent} style={{ marginTop: 24 }} />
      ) : (
        <GlassSurface style={styles.card}>
          <View style={styles.weekdayGrid}>
            {[
              WEEKDAY_LABELS_SHORT.slice(0, 3),
              WEEKDAY_LABELS_SHORT.slice(3),
            ].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.weekdayRow}>
                {row.map((label, col) => {
                  const index = rowIndex === 0 ? col : col + 3;
                  const active = daysInput.includes(index);
                  return (
                    <TouchableOpacity
                      key={label}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={label}
                      onPress={() => toggleTrainingDay(index)}
                      activeOpacity={0.75}
                      style={[
                        styles.weekdayChip,
                        active && styles.weekdayChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.weekdayChipText,
                          active && { color: T.accent },
                        ]}
                      >
                        {label.slice(0, 1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
          <Text style={styles.hint}>
            {daysInput.length} days a week. Changing days rebuilds your split,
            so today&apos;s workout may look different.
          </Text>
        </GlassSurface>
      )}
    </ProfileSubpageShell>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.lg,
      padding: 16,
      gap: 14,
    },
    weekdayGrid: { gap: 10 },
    weekdayRow: { flexDirection: "row", gap: 8, justifyContent: "center" },
    weekdayChip: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: T.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
    },
    weekdayChipActive: {
      borderColor: T.accent,
      backgroundColor: T.accentTint,
    },
    weekdayChipText: {
      fontFamily: T.bodyBold,
      fontSize: 14,
      color: T.white,
    },
    hint: {
      fontFamily: T.body,
      fontSize: 12,
      lineHeight: 17,
      color: T.muted,
    },
  });
}
