import {
  useAddMeal,
  useDailyTotals,
  useDeleteMeal,
  useMealLog,
  useNutritionGoals,
} from "@/src/features/nutrition/hooks/useNutrition";
import { requestFoodScanFromImage } from "@/src/utils/gemini";
import { Ionicons } from "@expo/vector-icons";
import { readAsStringAsync } from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { MealType } from "../types/nutrition.types";
import { MacroBar } from "./MacroBar";
import { ProgressCircle } from "./ProgressCircle";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  red: "#FF3D3D",
  orange: "#FF8A00",
  blue: "#3D8EFF",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

// ─── Meal metadata ────────────────────────────────────────────────────────────
const MEAL_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  Breakfast: { icon: "sunny-outline", color: T.orange },
  Snack: { icon: "leaf-outline", color: T.lime },
  Lunch: { icon: "partly-sunny-outline", color: T.blue },
  Dinner: { icon: "moon-outline", color: "#9B6DFF" },
};

const MEAL_TYPES: MealType[] = ["Breakfast", "Snack", "Lunch", "Dinner"];

const MAX_DAYS_BACK = 7;

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateFromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((v) => Number(v));
  return new Date(y, (m || 1) - 1, d || 1);
}

function displayDateLabel(ymd: string, offsetDays: number): string {
  if (offsetDays === 0) return "Today";
  if (offsetDays === 1) return "Yesterday";
  const date = dateFromYmd(ymd);
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${weekday} ${month} ${day}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroStat({
  label,
  value,
  unit,
  color = T.text,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  return (
    <View style={s.heroStat}>
      <Text style={s.heroStatLabel}>{label}</Text>
      <View style={s.heroStatValueRow}>
        <Text style={[s.heroStatValue, { color }]}>{value}</Text>
        {unit ? <Text style={s.heroStatUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

function FoodRow({
  item,
  onDelete,
}: {
  item: {
    id: string;
    name: string;
    cal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onDelete?: (id: string) => void;
}) {
  return (
    <View style={s.foodRow}>
      <View style={s.foodRowLeft}>
        <Text style={s.foodName}>{item.name}</Text>
        <Text style={s.foodMacros}>
          P {item.protein}g · C {item.carbs}g · F {item.fat}g
        </Text>
      </View>
      <View style={s.foodCalWrap}>
        <Text style={s.foodCal}>{item.cal}</Text>
        <Text style={s.foodCalUnit}>kcal</Text>
      </View>
      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={s.deleteBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={14} color={T.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function MealGroup({
  mealGroup,
  items,
  onDelete,
}: {
  mealGroup: string;
  items: {
    id: string;
    name: string;
    cal: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  onDelete: (id: string) => void;
}) {
  const meta = MEAL_META[mealGroup] ?? {
    icon: "restaurant-outline" as const,
    color: T.sub,
  };
  const groupCal = items.reduce((a, m) => a + m.cal, 0);

  return (
    <View style={s.mealGroup}>
      <View style={s.mealGroupHeader}>
        <View style={s.mealGroupLeft}>
          <View style={[s.mealIconBox, { backgroundColor: meta.color + "1A" }]}>
            <Ionicons name={meta.icon} size={15} color={meta.color} />
          </View>
          <Text style={s.mealGroupName}>{mealGroup}</Text>
        </View>
        <View
          style={[
            s.mealCalBadge,
            {
              backgroundColor: meta.color + "15",
              borderColor: meta.color + "30",
            },
          ]}
        >
          <Text style={[s.mealCalBadgeText, { color: meta.color }]}>
            {groupCal} kcal
          </Text>
        </View>
      </View>

      {items.map((item, idx) => (
        <View key={item.id}>
          {idx > 0 && <View style={s.itemDivider} />}
          <FoodRow item={item} onDelete={onDelete} />
        </View>
      ))}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CaloriesSection() {
  const [showAddFood, setShowAddFood] = useState(false);
  const [mealType, setMealType] = useState<MealType>("Breakfast");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [daysBack, setDaysBack] = useState(0);

  type EntryStep = "menu" | "analyzing" | "form";
  const [entryStep, setEntryStep] = useState<EntryStep>("menu");
  const [manualName, setManualName] = useState("");
  const [manualCal, setManualCal] = useState("");
  const [manualP, setManualP] = useState("");
  const [manualC, setManualC] = useState("");
  const [manualF, setManualF] = useState("");
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    return localYmd(d);
  }, [daysBack]);
  const dateLabel = useMemo(
    () => displayDateLabel(selectedDate, daysBack),
    [selectedDate, daysBack],
  );

  // ─── Data hooks ──────────────────────────────────────────────────────────────
  const { data: goals, isLoading: goalsLoading } = useNutritionGoals();
  const { data: mealLog, isLoading: logLoading } = useMealLog(selectedDate);
  const { data: totals, isLoading: totalsLoading } = useDailyTotals(selectedDate);
  const { mutate: addMeal } = useAddMeal();
  const { mutate: deleteMeal } = useDeleteMeal();

  const isLoading = goalsLoading || logLoading || totalsLoading;

  useEffect(() => {
    if (!showAddFood) return;
    setEntryStep("menu");
    setManualName("");
    setManualCal("");
    setManualP("");
    setManualC("");
    setManualF("");
    setGeminiError(null);
  }, [showAddFood]);

  // ─── Derived values ───────────────────────────────────────────────────────────
  const goalCal = goals?.calories ?? 2400;
  const burned = 0;
  const totalCal = totals?.cal ?? 0;
  const totalP = totals?.protein ?? 0;
  const totalC = totals?.carbs ?? 0;
  const totalF = totals?.fat ?? 0;

  const remaining = goalCal - totalCal;
  const pct = Math.min(Math.round((totalCal / goalCal) * 100), 100);
  const isOver = remaining < 0;

  // ─── Handlers ────────────────────────────────────────────────────────────────
  function handleAddFood(food: {
    id: string;
    name: string;
    cal: number;
    protein: number;
    carbs: number;
    fat: number;
  }) {
    setAddingId(food.id);
    addMeal(
      {
        log_date: selectedDate,
        meal: mealType,
        name: food.name,
        cal: food.cal,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        quantity: 1,
        unit: "serving",
      },
      {
        onSuccess: () => {
          setAddingId(null);
          setShowAddFood(false);
        },
        onError: () => setAddingId(null),
      },
    );
  }

  function handleDeleteFood(id: string) {
    deleteMeal(id);
  }

  async function pickAndAnalyzeWithGemini(source: "camera" | "library") {
    setEntryStep("analyzing");
    setGeminiError(null);
    try {
      if (source === "camera") {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        if (!cam.granted) {
          setGeminiError("Camera permission is required to scan.");
          setEntryStep("form");
          return;
        }
      } else {
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!lib.granted) {
          setGeminiError("Photo library permission is required to scan.");
          setEntryStep("form");
          return;
        }
      }

      const launched =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.8,
            });

      if (launched.canceled) {
        setEntryStep("menu");
        return;
      }

      const asset = launched.assets[0];
      const uri = asset.uri;

      const resized = await manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: SaveFormat.JPEG },
      );

      const base64 = await readAsStringAsync(resized.uri, { encoding: "base64" });
      const mimeType = "image/jpeg";

      if (base64.length > 4 * 1024 * 1024) {
        setGeminiError("Image is too large. Please try a different photo.");
        setEntryStep("form");
        return;
      }

      const parsed = await requestFoodScanFromImage(base64, mimeType);

      setManualName(parsed.name);
      setManualCal(String(parsed.cal));
      setManualP(String(parsed.protein));
      setManualC(String(parsed.carbs));
      setManualF(String(parsed.fat));
      setGeminiError(null);
      setEntryStep("form");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Scan failed. Please enter manually.";
      setGeminiError(msg);
      setEntryStep("form");
    }
  }

  function openScanSourcePicker() {
    Alert.alert("Scan food", "Choose a photo source", [
      {
        text: "Camera",
        onPress: () => {
          void pickAndAnalyzeWithGemini("camera");
        },
      },
      {
        text: "Photo library",
        onPress: () => {
          void pickAndAnalyzeWithGemini("library");
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function submitManualEntry() {
    const name = manualName.trim();
    const cal = Number(manualCal.replace(",", "."));
    if (!name || !Number.isFinite(cal) || cal <= 0) return;

    const protein = Number(manualP.replace(",", ".")) || 0;
    const carbs = Number(manualC.replace(",", ".")) || 0;
    const fat = Number(manualF.replace(",", ".")) || 0;

    handleAddFood({
      id: `manual-${Date.now()}`,
      name,
      cal,
      protein: Number.isFinite(protein) ? protein : 0,
      carbs: Number.isFinite(carbs) ? carbs : 0,
      fat: Number.isFinite(fat) ? fat : 0,
    });
  }

  const manualCalNum = Number(manualCal.replace(",", "."));
  const canSubmitManual =
    manualName.trim().length > 0 &&
    Number.isFinite(manualCalNum) &&
    manualCalNum > 0;

  // ─── Loading state ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={s.loadingWrap}>
        <ActivityIndicator size="large" color={T.lime} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.dateNavWrap}>
          <TouchableOpacity
            onPress={() =>
              setDaysBack((prev) => Math.min(MAX_DAYS_BACK, prev + 1))
            }
            disabled={daysBack >= MAX_DAYS_BACK}
            style={[s.dateArrowBtn, daysBack >= MAX_DAYS_BACK && s.dateArrowDisabled]}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={14} color={T.text} />
          </TouchableOpacity>
          <View style={s.datePill}>
            <Ionicons name="calendar-outline" size={10} color={T.muted} />
            <Text style={s.datePillText}>{dateLabel}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setDaysBack((prev) => Math.max(0, prev - 1))}
            disabled={daysBack === 0}
            style={[s.dateArrowBtn, daysBack === 0 && s.dateArrowDisabled]}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-forward" size={14} color={T.text} />
          </TouchableOpacity>
        </View>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <View style={s.heroCard}>
          <ProgressCircle
            pct={pct}
            size={128}
            stroke={11}
            color={pct > 90 ? T.red : T.lime}
            label={`${totalCal}`}
            sub="KCAL EATEN"
          />
          <View style={s.heroDivider} />
          <View style={s.heroStats}>
            <HeroStat label="Goal" value={goalCal} unit="kcal" />
            <View style={s.heroStatDivider} />
            <HeroStat
              label={isOver ? "Over" : "Remaining"}
              value={Math.abs(remaining)}
              unit="kcal"
              color={isOver ? T.red : T.lime}
            />
            <View style={s.heroStatDivider} />
            <HeroStat
              label="Burned"
              value={burned}
              unit="kcal"
              color={T.orange}
            />
          </View>
        </View>

        {/* ── MACROS ────────────────────────────────────────────────────────── */}
        <View style={s.macroCard}>
          <View style={s.macroCardHeader}>
            <Text style={s.cardTitle}>MACROS</Text>
            <Text style={s.macroKcal}>
              {(totalP * 4 + totalC * 4 + totalF * 9).toLocaleString()} kcal
              logged
            </Text>
          </View>
          <MacroBar
            label="Protein"
            current={totalP}
            goal={goals?.protein ?? 180}
            color={T.blue}
          />
          <MacroBar
            label="Carbs"
            current={totalC}
            goal={goals?.carbs ?? 280}
            color={T.orange}
          />
          <MacroBar
            label="Fat"
            current={totalF}
            goal={goals?.fat ?? 80}
            color={T.red}
          />
        </View>

        {/* ── MEALS ─────────────────────────────────────────────────────────── */}
        <View style={s.mealsHeader}>
          <Text style={s.cardTitle}>TODAY'S MEALS</Text>
          <TouchableOpacity
            style={s.addFoodBtn}
            activeOpacity={0.8}
            onPress={() => setShowAddFood(true)}
          >
            <Ionicons name="add" size={14} color={T.bg0} />
            <Text style={s.addFoodBtnText}>Add Food</Text>
          </TouchableOpacity>
        </View>

        {mealLog &&
          MEAL_TYPES.map((mealGroup) => {
            const items = mealLog.filter((m) => m.meal === mealGroup);
            if (!items.length) return null;
            return (
              <MealGroup
                key={mealGroup}
                mealGroup={mealGroup}
                items={items}
                onDelete={handleDeleteFood}
              />
            );
          })}

        {mealLog?.length === 0 && (
          <View style={s.emptyMeals}>
            <Ionicons name="restaurant-outline" size={32} color={T.muted} />
            <Text style={s.emptyMealsText}>No meals logged today</Text>
            <Text style={s.emptyMealsSub}>Tap + Add Food to get started</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── ADD FOOD MODAL ──────────────────────────────────────────────────── */}
      <Modal visible={showAddFood} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />

            {/* Header */}
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>ADD FOOD</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddFood(false);
                }}
                style={s.sheetCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={16} color={T.sub} />
              </TouchableOpacity>
            </View>

            {/* Meal type selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.mealTypeScroll}
            >
              {MEAL_TYPES.map((t) => {
                const active = mealType === t;
                const meta = MEAL_META[t];
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setMealType(t)}
                    activeOpacity={0.75}
                    style={[
                      s.mealTypeChip,
                      active && {
                        backgroundColor: T.lime,
                        borderColor: T.lime,
                      },
                    ]}
                  >
                    <Ionicons
                      name={meta.icon}
                      size={13}
                      color={active ? T.bg0 : meta.color}
                    />
                    <Text style={[s.mealTypeText, active && { color: T.bg0 }]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Add-food flow: AI scan vs manual */}
            <ScrollView
              style={s.modalBodyScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {entryStep === "menu" ? (
                <View style={s.entryMenu}>
                  <TouchableOpacity
                    style={s.scanPrimaryBtn}
                    activeOpacity={0.85}
                    onPress={openScanSourcePicker}
                  >
                    <Ionicons name="camera-outline" size={18} color={T.bg0} />
                    <Text style={s.scanPrimaryBtnText}>Scan with AI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.manualSecondaryBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      setGeminiError(null);
                      setManualName("");
                      setManualCal("");
                      setManualP("");
                      setManualC("");
                      setManualF("");
                      setEntryStep("form");
                    }}
                  >
                    <Text style={s.manualSecondaryBtnText}>Enter manually</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {entryStep === "analyzing" ? (
                <View style={s.analyzingWrap}>
                  <ActivityIndicator size="large" color={T.lime} />
                  <Text style={s.analyzingText}>Analyzing food…</Text>
                </View>
              ) : null}

              {entryStep === "form" ? (
                <View style={s.manualForm}>
                  {geminiError ? (
                    <Text style={s.geminiErrorText}>{geminiError}</Text>
                  ) : null}

                  <Text style={s.formLabel}>Food name</Text>
                  <TextInput
                    value={manualName}
                    onChangeText={setManualName}
                    placeholder="Food name"
                    placeholderTextColor={T.muted}
                    style={s.formInput}
                  />

                  <Text style={s.formLabel}>Calories</Text>
                  <TextInput
                    value={manualCal}
                    onChangeText={setManualCal}
                    placeholder="Calories"
                    placeholderTextColor={T.muted}
                    style={s.formInput}
                    keyboardType="numeric"
                  />

                  <Text style={s.formLabel}>Protein (g)</Text>
                  <TextInput
                    value={manualP}
                    onChangeText={setManualP}
                    placeholder="0"
                    placeholderTextColor={T.muted}
                    style={s.formInput}
                    keyboardType="numeric"
                  />

                  <Text style={s.formLabel}>Carbs (g)</Text>
                  <TextInput
                    value={manualC}
                    onChangeText={setManualC}
                    placeholder="0"
                    placeholderTextColor={T.muted}
                    style={s.formInput}
                    keyboardType="numeric"
                  />

                  <Text style={s.formLabel}>Fat (g)</Text>
                  <TextInput
                    value={manualF}
                    onChangeText={setManualF}
                    placeholder="0"
                    placeholderTextColor={T.muted}
                    style={s.formInput}
                    keyboardType="numeric"
                  />

                  <TouchableOpacity
                    style={[
                      s.addToLogBtn,
                      (!canSubmitManual || addingId !== null) &&
                        s.addToLogBtnDisabled,
                    ]}
                    activeOpacity={0.85}
                    disabled={!canSubmitManual || addingId !== null}
                    onPress={submitManualEntry}
                  >
                    {addingId !== null ? (
                      <ActivityIndicator size="small" color={T.bg0} />
                    ) : (
                      <Text style={s.addToLogBtnText}>Add to Log</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.formBackBtn}
                    activeOpacity={0.75}
                    onPress={() => {
                      setGeminiError(null);
                      setEntryStep("menu");
                    }}
                  >
                    <Text style={s.formBackBtnText}>← Back</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dateNavWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  dateArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dateArrowDisabled: {
    opacity: 0.35,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  datePillText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 0.5,
  },

  // ── Loading ──────────────────────────────────────────────────────────────────
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },

  // ── Hero card ────────────────────────────────────────────────────────────────
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.borderMid,
    padding: 18,
    marginBottom: 12,
    gap: 16,
  },
  heroDivider: {
    width: 1,
    height: 80,
    backgroundColor: T.border,
  },
  heroStats: {
    flex: 1,
    gap: 10,
  },
  heroStat: {
    gap: 1,
  },
  heroStatLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 0.5,
  },
  heroStatValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  heroStatValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.text,
    lineHeight: 22,
  },
  heroStatUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.sub,
  },
  heroStatDivider: {
    height: 1,
    backgroundColor: T.border,
  },

  // ── Macro card ───────────────────────────────────────────────────────────────
  macroCard: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  macroCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.text,
    letterSpacing: 1.0,
  },
  macroKcal: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.muted,
  },

  // ── Meals section ────────────────────────────────────────────────────────────
  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addFoodBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.lime,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addFoodBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.bg0,
    letterSpacing: 0.5,
  },

  // ── Meal group ───────────────────────────────────────────────────────────────
  mealGroup: {
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    padding: 14,
    marginBottom: 10,
  },
  mealGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealGroupLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mealIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mealIcon: {
    fontSize: 14,
  },
  mealGroupName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.text,
  },
  mealCalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  mealCalBadgeText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    letterSpacing: 0.3,
  },

  // ── Food rows ────────────────────────────────────────────────────────────────
  itemDivider: {
    height: 1,
    backgroundColor: T.border,
    marginVertical: 8,
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  foodRowLeft: {
    flex: 1,
    gap: 2,
  },
  foodName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: T.text,
  },
  foodMacros: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  foodCalWrap: {
    alignItems: "flex-end",
  },
  foodCal: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.lime,
    lineHeight: 16,
  },
  foodCalUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: T.red + "12",
    borderWidth: 1,
    borderColor: T.red + "25",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Empty meals ───────────────────────────────────────────────────────────────
  emptyMeals: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyMealsText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.sub,
  },
  emptyMealsSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
  },

  // ── Modal ────────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: T.bg1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: T.borderMid,
    padding: 20,
    maxHeight: "92%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: T.bg3,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: T.text,
    letterSpacing: 1.0,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseText: {
    fontSize: 12,
    color: T.sub,
  },

  // ── Meal type chips ───────────────────────────────────────────────────────────
  mealTypeScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  mealTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.border,
  },
  mealTypeIcon: {
    fontSize: 13,
  },
  mealTypeText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: T.text,
  },

  // ── Search ────────────────────────────────────────────────────────────────────
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.text,
  },
  searchClear: {
    fontSize: 11,
    color: T.muted,
    padding: 4,
  },
  searchLoading: {
    paddingVertical: 40,
    alignItems: "center",
  },

  // ── Food list ─────────────────────────────────────────────────────────────────
  foodList: {
    maxHeight: 360,
  },
  listDivider: {
    height: 1,
    backgroundColor: T.border,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  listItemLeft: {
    flex: 1,
    gap: 2,
  },
  listItemName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: T.text,
  },
  listItemMacros: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  listItemRight: {
    alignItems: "flex-end",
  },
  listItemCal: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.lime,
    lineHeight: 16,
  },
  listItemCalUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
  },
  listItemAdd: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: T.lime + "1A",
    borderWidth: 1,
    borderColor: T.lime + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  listItemAddText: {
    fontSize: 16,
    color: T.lime,
    lineHeight: 18,
  },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyStateText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.muted,
  },

  // ── Add food modal: scan / manual ───────────────────────────────────────────
  modalBodyScroll: {
    maxHeight: 420,
  },
  entryMenu: {
    gap: 12,
    paddingBottom: 8,
  },
  scanPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.lime,
    paddingVertical: 14,
    borderRadius: 12,
  },
  scanPrimaryBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.bg0,
    letterSpacing: 0.5,
  },
  manualSecondaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.borderMid,
    backgroundColor: T.bg3,
  },
  manualSecondaryBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.text,
  },
  analyzingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 14,
  },
  analyzingText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: T.sub,
  },
  manualForm: {
    gap: 8,
    paddingBottom: 12,
  },
  geminiErrorText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.red,
    marginBottom: 8,
    lineHeight: 18,
  },
  formLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.muted,
    marginTop: 4,
  },
  formInput: {
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.text,
  },
  addToLogBtn: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: T.lime,
  },
  addToLogBtnDisabled: {
    opacity: 0.45,
  },
  addToLogBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.bg0,
    letterSpacing: 0.5,
  },
  formBackBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  formBackBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: T.sub,
  },
});
