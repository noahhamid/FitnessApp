import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ProfileSubpageShell } from "@/src/features/profile/components/ProfileSubpageShell";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import {
  fetchUserProfile,
  saveUserProfile,
} from "@/src/features/profile/services/profile.service";
import {
  isProfileGoalId,
  PROFILE_GOALS,
  type ProfileGoalId,
} from "@/src/features/profile/lib/profile-edit-options";
import { workoutPlanQueryKey } from "@/src/features/workout/hooks/useWorkoutPlan";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

export default function FitnessGoalScreen() {
  const { T, styles } = useThemedStyles(makeStyles);
  const router = useRouter();
  const qc = useQueryClient();
  const { data: profile, isPending } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });

  const [goalInput, setGoalInput] = useState<ProfileGoalId>("health");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isProfileGoalId(profile?.goalId)) setGoalInput(profile.goalId);
  }, [profile?.goalId]);

  async function onSave() {
    setSaving(true);
    try {
      const changed = goalInput !== profile?.goalId;
      await saveUserProfile({ goalId: goalInput });
      await qc.invalidateQueries({ queryKey: ["user", "profile"] });
      await qc.invalidateQueries({ queryKey: ["nutrition", "goals"] });
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
      title="Fitness Goal"
      subtitle="What you're training for"
      onSave={() => void onSave()}
      saving={saving}
      saveDisabled={isPending}
    >
      {isPending ? (
        <ActivityIndicator color={T.accent} style={{ marginTop: 24 }} />
      ) : (
        <GlassSurface style={styles.card}>
          <View style={styles.grid}>
            {PROFILE_GOALS.map((goal) => {
              const active = goalInput === goal.id;
              return (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => setGoalInput(goal.id)}
                  activeOpacity={0.75}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Ionicons
                    name={goal.icon}
                    size={14}
                    color={active ? T.accent : T.muted}
                  />
                  <Text
                    style={[styles.chipText, active && { color: T.accent }]}
                  >
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.hint}>
            Changing your goal rebuilds your workout split and nutrition
            targets.
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
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: T.radius.pill,
      backgroundColor: T.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
    },
    chipActive: {
      borderColor: T.accent,
      backgroundColor: T.accentTint,
    },
    chipText: {
      fontFamily: T.bodySemi,
      fontSize: 13,
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
