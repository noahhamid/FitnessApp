// app/scan-meal.tsx
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, Camera, RotateCcw } from "lucide-react-native";

import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { PressableScale } from "../components/PressableScale";
import { useAddMeal } from "../hooks/useNutrition";
import { scanFoodImage } from "../services/nutrition.service";
import type { FoodScanResult, MealType } from "../types/nutrition.types";

const MEAL_SLOTS: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

function todayStr(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

type Status = "idle" | "capturing" | "analyzing" | "reviewing" | "error";

export default function ScanMealScreen() {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{ slot?: string; date?: string }>();
  const logDate = params.date ?? todayStr();
  const initialSlot = MEAL_SLOTS.includes(params.slot as MealType)
    ? (params.slot as MealType)
    : "Breakfast";

  const [status, setStatus] = useState<Status>("idle");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<FoodScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [slot, setSlot] = useState<MealType>(initialSlot);
  const [name, setName] = useState("");
  const [cal, setCal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const addMeal = useAddMeal();

  const capture = async () => {
    setErrorMsg(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setErrorMsg("Camera permission is needed to scan food.");
      return;
    }

    setStatus("capturing");
    const picked = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.6,
      allowsEditing: false,
    });

    if (picked.canceled || !picked.assets?.[0]) {
      setStatus("idle");
      return;
    }

    const asset = picked.assets[0];
    setPhotoUri(asset.uri);

    if (!asset.base64) {
      setStatus("error");
      setErrorMsg("Couldn't read that photo. Try again.");
      return;
    }

    setStatus("analyzing");
    try {
      const mimeType = asset.mimeType ?? "image/jpeg";
      const scan = await scanFoodImage(asset.base64, mimeType);
      setResult(scan);
      setName(scan.name);
      setCal(String(scan.cal));
      setProtein(String(scan.protein));
      setCarbs(String(scan.carbs));
      setFat(String(scan.fat));
      setStatus("reviewing");
    } catch {
      setStatus("error");
      setErrorMsg(
        "Couldn't analyze that photo. Try again or enter it manually.",
      );
    }
  };

  const retake = () => {
    setPhotoUri(null);
    setResult(null);
    setStatus("idle");
  };

  const canSubmit =
    name.trim().length > 0 &&
    cal.trim().length > 0 &&
    !Number.isNaN(Number(cal)) &&
    !addMeal.isPending;

  const handleSave = () => {
    if (!canSubmit) return;
    addMeal.mutate(
      {
        log_date: logDate,
        meal: slot,
        name: name.trim(),
        cal: Math.round(Number(cal)),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        quantity: 1,
        unit: "serving",
        image_url: null,
        source: "scan",
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={T.bg}
        translucent={false}
      />

      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color={T.white} strokeWidth={2.2} />
        </PressableScale>
        <Text style={styles.headerTitle}>Scan food</Text>
        <View style={{ width: 34 }} />
      </View>

      {status === "idle" && (
        <View style={styles.centerFill}>
          <View style={styles.captureRing}>
            <Camera size={30} color={T.accent} strokeWidth={1.8} />
          </View>
          <Text style={styles.hint}>
            Snap a photo of your meal and{"\n"}we'll estimate the macros.
          </Text>
          {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
          <PressableScale onPress={capture} style={styles.captureBtnPressable}>
            <View style={styles.captureBtn}>
              <Text style={styles.captureBtnText}>Open camera</Text>
            </View>
          </PressableScale>
        </View>
      )}

      {(status === "capturing" || status === "analyzing") && (
        <View style={styles.centerFill}>
          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.previewSmall} />
          )}
          <ActivityIndicator
            color={T.accent}
            size="small"
            style={{ marginTop: 18 }}
          />
          <Text style={styles.hint}>
            {status === "analyzing"
              ? "Analyzing your meal…"
              : "Opening camera…"}
          </Text>
        </View>
      )}

      {status === "error" && (
        <View style={styles.centerFill}>
          <Text style={styles.error}>{errorMsg}</Text>
          <PressableScale onPress={capture} style={styles.captureBtnPressable}>
            <View style={styles.captureBtn}>
              <Text style={styles.captureBtnText}>Try again</Text>
            </View>
          </PressableScale>
        </View>
      )}

      {status === "reviewing" && (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {photoUri && (
            <View style={styles.previewWrap}>
              <Image source={{ uri: photoUri }} style={styles.preview} />
              <PressableScale onPress={retake} style={styles.retakeBtn}>
                <RotateCcw size={14} color={T.onImage} strokeWidth={2.2} />
                <Text style={styles.retakeText}>Retake</Text>
              </PressableScale>
            </View>
          )}

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
            placeholderTextColor={T.muted}
            style={styles.input}
          />

          <Text style={styles.label}>Calories</Text>
          <TextInput
            value={cal}
            onChangeText={setCal}
            keyboardType="number-pad"
            placeholderTextColor={T.muted}
            style={styles.input}
          />

          <View style={styles.macroRow}>
            <View style={styles.macroField}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="decimal-pad"
                placeholderTextColor={T.muted}
                style={styles.input}
              />
            </View>
            <View style={styles.macroField}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
                placeholderTextColor={T.muted}
                style={styles.input}
              />
            </View>
            <View style={styles.macroField}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                value={fat}
                onChangeText={setFat}
                keyboardType="decimal-pad"
                placeholderTextColor={T.muted}
                style={styles.input}
              />
            </View>
          </View>

          {addMeal.isError && (
            <Text style={styles.error}>
              Couldn't save that meal — try again.
            </Text>
          )}

          <PressableScale
            onPress={handleSave}
            disabled={!canSubmit}
            style={[
              styles.submitPressable,
              !canSubmit && styles.submitDisabled,
            ]}
          >
            <View style={styles.submitBtn}>
              <Text style={styles.submitText}>
                {addMeal.isPending ? "Saving…" : "Save meal"}
              </Text>
            </View>
          </PressableScale>
        </ScrollView>
      )}
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
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 6,
  },
  captureRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    borderColor: T.ringBorder,
    backgroundColor: T.ringGlass,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  hint: {
    fontFamily: T.bodyMed,
    fontSize: 13,
    color: T.muted,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 22,
  },
  captureBtnPressable: { borderRadius: 17, marginTop: 8 },
  captureBtn: {
    backgroundColor: T.accent,
    borderRadius: 17,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  captureBtnText: { fontFamily: T.bodyBold, fontSize: 14, color: T.onAccent },
  previewSmall: { width: 120, height: 120, borderRadius: 18 },
  error: {
    fontFamily: T.bodyMed,
    fontSize: 12.5,
    color: T.badge,
    textAlign: "center",
    marginBottom: 14,
  },
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 60, gap: 6 },
  previewWrap: { borderRadius: 22, overflow: "hidden", marginBottom: 6 },
  preview: { width: "100%", height: 200 },
  retakeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.onImageGlass,
    borderWidth: 1,
    borderColor: T.onImageBorder,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  retakeText: { fontFamily: T.bodySemi, fontSize: 11, color: T.onImage },
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
  submitPressable: { borderRadius: 17, marginTop: 24 },
  submitDisabled: { opacity: 0.4 },
  submitBtn: {
    backgroundColor: T.accent,
    borderRadius: 17,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitText: { fontFamily: T.bodyBold, fontSize: 14, color: T.onAccent },
  });
}
