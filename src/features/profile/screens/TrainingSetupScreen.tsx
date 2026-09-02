import { useEffect, useState } from "react";
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
  type EquipmentAccess,
  type ExperienceLevel,
} from "@/src/features/profile/services/profile.service";
import {
  PROFILE_EQUIPMENT_OPTIONS,
  PROFILE_EXPERIENCE_OPTIONS,
} from "@/src/features/profile/lib/profile-edit-options";
import { workoutPlanQueryKey } from "@/src/features/workout/hooks/useWorkoutPlan";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

export default function TrainingSetupScreen() {
  const { T, styles } = useThemedStyles(makeStyles);
  const router = useRouter();
  const qc = useQueryClient();
  const { data: profile, isPending } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });

  const [experienceInput, setExperienceInput] =
    useState<ExperienceLevel>("novice");
  const [equipmentInput, setEquipmentInput] =
    useState<EquipmentAccess>("full_gym");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (
      profile?.experience === "novice" ||
      profile?.experience === "intermediate" ||
      profile?.experience === "advanced"
    ) {
      setExperienceInput(profile.experience);
    }
    if (
      profile?.equipment === "full_gym" ||
      profile?.equipment === "home_dumbbells" ||
      profile?.equipment === "bodyweight"
    ) {
      setEquipmentInput(profile.equipment);
    }
  }, [profile?.experience, profile?.equipment]);

  async function onSave() {
    setSaving(true);
    try {
      const changed =
        experienceInput !== profile?.experience ||
        equipmentInput !== profile?.equipment;
      await saveUserProfile({
        experience: experienceInput,
        equipment: equipmentInput,
      });
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
      title="Training Setup"
      subtitle="Experience · Equipment"
      onSave={() => void onSave()}
      saving={saving}
      saveDisabled={isPending}
    >
      {isPending ? (
        <ActivityIndicator color={T.accent} style={{ marginTop: 24 }} />
      ) : (
        <GlassSurface style={styles.card}>
          <Text style={styles.sectionLabel}>Experience</Text>
          <View style={styles.grid}>
            {PROFILE_EXPERIENCE_OPTIONS.map((option) => {
              const active = experienceInput === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setExperienceInput(option.id)}
                  activeOpacity={0.75}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && { color: T.accent }]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
            Equipment
          </Text>
          <View style={styles.grid}>
            {PROFILE_EQUIPMENT_OPTIONS.map((option) => {
              const active = equipmentInput === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setEquipmentInput(option.id)}
                  activeOpacity={0.75}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && { color: T.accent }]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.hint}>
            Changing level or equipment rebuilds your workout split.
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
      gap: 10,
    },
    sectionLabel: {
      fontFamily: T.bodyBold,
      fontSize: 11,
      letterSpacing: 0.6,
      color: T.muted,
      textTransform: "uppercase",
    },
    sectionSpaced: { marginTop: 8 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
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
      marginTop: 4,
    },
  });
}
