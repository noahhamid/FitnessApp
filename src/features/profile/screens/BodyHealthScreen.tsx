import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
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
import { parsePositiveNumber } from "@/src/features/profile/lib/profile-edit-options";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { appAlert } from "@/src/components/AppAlert";

export default function BodyHealthScreen() {
  const { T, styles } = useThemedStyles(makeStyles);
  const router = useRouter();
  const qc = useQueryClient();
  const { data: profile, isPending } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });

  const [weightInput, setWeightInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setWeightInput(
      typeof profile.weightKg === "number" && profile.weightKg > 0
        ? String(Number(profile.weightKg.toFixed(2)))
        : "",
    );
    setHeightInput(
      typeof profile.heightCm === "number" && profile.heightCm > 0
        ? String(profile.heightCm)
        : "",
    );
    setAgeInput(
      typeof profile.age === "number" && profile.age > 0
        ? String(profile.age)
        : "",
    );
  }, [profile]);

  async function onSave() {
    const nextWeight = parsePositiveNumber(weightInput);
    const nextHeight = parsePositiveNumber(heightInput);
    const nextAge = parsePositiveNumber(ageInput);
    if (!nextWeight || !nextHeight || !nextAge) {
      appAlert(
        "Incomplete profile",
        "Weight, height, and age must be valid numbers.",
      );
      return;
    }
    setSaving(true);
    try {
      await saveUserProfile({
        weightKg: Number(nextWeight.toFixed(2)),
        heightCm: Math.round(nextHeight),
        age: Math.round(nextAge),
      });
      await qc.invalidateQueries({ queryKey: ["user", "profile"] });
      await qc.invalidateQueries({ queryKey: ["nutrition", "goals"] });
      router.back();
    } catch (err) {
      appAlert(
        "Save failed",
        err instanceof Error ? err.message : "Unable to save.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProfileSubpageShell
      title="Body & Health"
      subtitle="Weight · Height · Age"
      onSave={() => void onSave()}
      saving={saving}
      saveDisabled={isPending}
    >
      {isPending ? (
        <ActivityIndicator color={T.accent} style={{ marginTop: 24 }} />
      ) : (
        <GlassSurface style={styles.card}>
          <View style={styles.fieldRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                placeholder="75"
                placeholderTextColor={T.muted}
                style={styles.input}
                selectTextOnFocus
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                value={heightInput}
                onChangeText={setHeightInput}
                keyboardType="number-pad"
                placeholder="175"
                placeholderTextColor={T.muted}
                style={styles.input}
                selectTextOnFocus
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                value={ageInput}
                onChangeText={setAgeInput}
                keyboardType="number-pad"
                placeholder="25"
                placeholderTextColor={T.muted}
                style={styles.input}
                selectTextOnFocus
              />
            </View>
          </View>
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
      gap: 12,
      marginTop: 4,
    },
    fieldRow: {
      flexDirection: "row",
      gap: 10,
    },
    field: { gap: 6 },
    label: {
      fontFamily: T.bodyMed,
      fontSize: 10,
      color: T.muted,
      letterSpacing: 0.4,
    },
    input: {
      fontFamily: T.body,
      fontSize: 14,
      color: T.white,
      backgroundColor: T.accentTint,
      borderRadius: T.radius.sm,
      borderWidth: 0.5,
      borderColor: T.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
  });
}
