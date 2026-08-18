// app/log-meal.tsx
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { PressableScale } from "../components/PressableScale";
import { useAddMeal, useDeleteMeal, useUpdateMeal } from "../hooks/useNutrition";
import type { MealType } from "../types/nutrition.types";

const MEAL_SLOTS: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

function todayStr(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function firstParam(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function LogMealScreen() {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{
    slot?: string;
    date?: string;
    id?: string;
    name?: string;
    cal?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  }>();

  const mealId = firstParam(params.id);
  const isEdit = Boolean(mealId);
  const initialSlot = MEAL_SLOTS.includes(firstParam(params.slot) as MealType)
    ? (firstParam(params.slot) as MealType)
    : "Breakfast";
  const logDate = firstParam(params.date) ?? todayStr();

  const [slot, setSlot] = useState<MealType>(initialSlot);
  const [name, setName] = useState(firstParam(params.name) ?? "");
  const [cal, setCal] = useState(firstParam(params.cal) ?? "");
  const [protein, setProtein] = useState(firstParam(params.protein) ?? "");
  const [carbs, setCarbs] = useState(firstParam(params.carbs) ?? "");
  const [fat, setFat] = useState(firstParam(params.fat) ?? "");

  const addMeal = useAddMeal();
  const updateMeal = useUpdateMeal();
  const deleteMeal = useDeleteMeal(logDate);

  const saving =
    addMeal.isPending || updateMeal.isPending || deleteMeal.isPending;
  const nameValid = name.trim().length > 0;
  const calValid = cal.trim().length > 0 && !Number.isNaN(Number(cal));
  const canSubmit = nameValid && calValid && !saving;

  const payload = () => ({
    log_date: logDate,
    meal: slot,
    name: name.trim(),
    cal: Math.round(Number(cal)),
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
  });

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (isEdit && mealId) {
      updateMeal.mutate(
        { id: mealId, ...payload() },
        { onSuccess: () => router.back() },
      );
      return;
    }

    addMeal.mutate(
      {
        ...payload(),
        quantity: 1,
        unit: "serving",
        image_url: null,
        source: "manual",
      },
      { onSuccess: () => router.back() },
    );
  };

  const handleDelete = () => {
    if (!mealId || deleteMeal.isPending) return;
    Alert.alert("Delete meal", "Remove this meal from the diary?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteMeal.mutate(mealId, { onSuccess: () => router.back() }),
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />

      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={T.white} strokeWidth={2.2} />
        </PressableScale>
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit meal" : "Log meal"}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Meal</Text>
          <View style={styles.slotRow}>
            {MEAL_SLOTS.map((s) => (
              <PressableScale
                key={s}
                onPress={() => setSlot(s)}
                scaleTo={0.96}
                style={styles.slotPressable}
              >
                <View
                  style={[styles.slotChip, slot === s && styles.slotChipActive]}
                >
                  <Text
                    style={[
                      styles.slotText,
                      slot === s && styles.slotTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </View>

          <Text style={styles.label}>Food name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Grilled chicken salad"
            placeholderTextColor={T.muted}
            style={styles.input}
          />

          <Text style={styles.label}>Calories</Text>
          <TextInput
            value={cal}
            onChangeText={setCal}
            placeholder="0"
            placeholderTextColor={T.muted}
            keyboardType="number-pad"
            style={styles.input}
          />

          <View style={styles.macroRow}>
            <View style={styles.macroField}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={setCarbs}
                placeholder="0"
                placeholderTextColor={T.muted}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.macroField}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                placeholderTextColor={T.muted}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.macroField}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                value={fat}
                onChangeText={setFat}
                placeholder="0"
                placeholderTextColor={T.muted}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
          </View>

          {(addMeal.isError || updateMeal.isError || deleteMeal.isError) && (
            <Text style={styles.error}>
              Couldn't save that meal — try again.
            </Text>
          )}

          <PressableScale
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[
              styles.submitPressable,
              !canSubmit && styles.submitDisabled,
            ]}
          >
            <View style={styles.submitBtn}>
              <Text style={styles.submitText}>
                {saving && !deleteMeal.isPending
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Save meal"}
              </Text>
            </View>
          </PressableScale>

          {isEdit ? (
            <PressableScale
              onPress={handleDelete}
              disabled={saving}
              style={[
                styles.deletePressable,
                saving && styles.submitDisabled,
              ]}
            >
              <View style={styles.deleteBtn}>
                <Text style={styles.deleteText}>
                  {deleteMeal.isPending ? "Deleting…" : "Delete meal"}
                </Text>
              </View>
            </PressableScale>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.glass,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  headerTitle: { fontFamily: T.display, fontSize: 17, color: T.white },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60, gap: 6 },
  label: {
    fontFamily: T.bodySemi,
    fontSize: 11.5,
    color: T.muted,
    marginTop: 14,
    marginBottom: 8,
  },
  slotRow: { flexDirection: "row", gap: 8 },
  slotPressable: { flex: 1, borderRadius: 13 },
  slotChip: {
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 13,
    backgroundColor: T.glass,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
  },
  slotChipActive: { backgroundColor: T.accent, borderColor: T.accent },
  slotText: { fontFamily: T.bodySemi, fontSize: 11.5, color: T.white },
  slotTextActive: { color: T.onAccent },
  input: {
    backgroundColor: T.glass,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: T.bodyMed,
    fontSize: 14,
    color: T.white,
  },
  macroRow: { flexDirection: "row", gap: 10 },
  macroField: { flex: 1 },
  error: {
    fontFamily: T.bodyMed,
    fontSize: 11.5,
    color: T.badge,
    marginTop: 12,
  },
  submitPressable: { borderRadius: 17, marginTop: 24 },
  submitDisabled: { opacity: 0.4 },
  submitBtn: {
    backgroundColor: T.accent,
    borderRadius: 17,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitText: { fontFamily: T.bodyBold, fontSize: 14, color: T.onAccent },
  deletePressable: { borderRadius: 17, marginTop: 12 },
  deleteBtn: {
    backgroundColor: T.glass,
    borderRadius: 17,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: T.glassBorder,
  },
  deleteText: { fontFamily: T.bodyBold, fontSize: 14, color: T.badge },
  });
}
