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
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { MealType } from "../types/nutrition.types";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E",
  bg3: "#252525",
  gold: "#FFC700",
  red: "#FF453A",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];
const MEAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Breakfast: "sunny-outline",
  Lunch: "partly-sunny-outline",
  Dinner: "moon-outline",
  Snack: "leaf-outline",
};
const MAX_DAYS_BACK = 7;

// ── Helpers ───────────────────────────────────────────────────────────────────
function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function displayDateLabel(ymd: string, offsetDays: number): string {
  if (offsetDays === 0) return "Today";
  if (offsetDays === 1) return "Yesterday";
  const [y, mo, d] = ymd.split("-").map(Number);
  const date = new Date(y, (mo || 1) - 1, d || 1);
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day2 = parts.find((p) => p.type === "day")?.value ?? "";
  return `${weekday} ${month} ${day2}`;
}

// ── MacroCell ─────────────────────────────────────────────────────────────────
function MacroCell({
  label,
  current,
  goal,
}: {
  label: string;
  current: number;
  goal: number;
}) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barW = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={s.macroCell}>
      <Text style={s.macroCellValue}>{Math.round(current)}g</Text>
      <Text style={s.macroCellGoal}>/ {goal}g</Text>
      <View style={s.macroCellTrack}>
        <Animated.View style={[s.macroCellFill, { width: barW }]} />
      </View>
      <Text style={s.macroCellLabel}>{label}</Text>
    </View>
  );
}

// ── FoodRow ───────────────────────────────────────────────────────────────────
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
        <Text style={s.foodName} numberOfLines={1}>
          {item.name}
        </Text>
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
          <Ionicons name="trash-outline" size={13} color={T.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── MealGroup ─────────────────────────────────────────────────────────────────
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
  const icon = MEAL_ICONS[mealGroup] ?? "restaurant-outline";
  const groupCal = items.reduce((a, m) => a + m.cal, 0);

  return (
    <View style={s.mealGroup}>
      {/* Header */}
      <View style={s.mealGroupHeader}>
        <View style={s.mealGroupLeft}>
          <View style={s.mealIconBox}>
            <Ionicons name={icon} size={15} color={T.gold} />
          </View>
          <Text style={s.mealGroupName}>{mealGroup}</Text>
        </View>
        <View style={s.mealCalBadge}>
          <Text style={s.mealCalBadgeText}>{groupCal} kcal</Text>
        </View>
      </View>

      {/* Food rows */}
      {items.map((item, idx) => (
        <View key={item.id}>
          {idx > 0 && <View style={s.itemDivider} />}
          <FoodRow item={item} onDelete={onDelete} />
        </View>
      ))}
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
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

  const { data: goals, isLoading: goalsLoading } = useNutritionGoals();
  const { data: mealLog, isLoading: logLoading } = useMealLog(selectedDate);
  const { data: totals, isLoading: totalsLoading } =
    useDailyTotals(selectedDate);
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

  const goalCal = goals?.calories ?? 2400;
  const totalCal = totals?.cal ?? 0;
  const totalP = totals?.protein ?? 0;
  const totalC = totals?.carbs ?? 0;
  const totalF = totals?.fat ?? 0;
  const goalP = goals?.protein ?? 180;
  const goalC = goals?.carbs ?? 280;
  const goalF = goals?.fat ?? 80;

  const remaining = goalCal - totalCal;
  const pct = Math.min(Math.round((totalCal / goalCal) * 100), 100);
  const isOver = remaining < 0;

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

  async function pickAndAnalyzeWithGemini(source: "camera" | "library") {
    if (entryStep === "analyzing") return;
    setEntryStep("analyzing");
    setGeminiError(null);
    try {
      if (source === "camera") {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        if (!cam.granted) {
          setGeminiError("Camera permission required.");
          setEntryStep("form");
          return;
        }
      } else {
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!lib.granted) {
          setGeminiError("Photo library permission required.");
          setEntryStep("form");
          return;
        }
      }
      const launched =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.8,
            });
      if (launched.canceled) {
        setEntryStep("menu");
        return;
      }
      const resized = await manipulateAsync(
        launched.assets[0].uri,
        [{ resize: { width: 768 } }],
        { compress: 0.7, format: SaveFormat.JPEG },
      );
      const base64 = await readAsStringAsync(resized.uri, {
        encoding: "base64",
      });
      if (base64.length > 4 * 1024 * 1024) {
        setGeminiError("Image too large. Try a different photo.");
        setEntryStep("form");
        return;
      }
      const parsed = await requestFoodScanFromImage(base64, "image/jpeg");
      setManualName(parsed.name);
      setManualCal(String(parsed.cal));
      setManualP(String(parsed.protein));
      setManualC(String(parsed.carbs));
      setManualF(String(parsed.fat));
      setGeminiError(null);
      setEntryStep("form");
    } catch (e) {
      setGeminiError(
        e instanceof Error ? e.message : "Scan failed. Enter manually.",
      );
      setEntryStep("form");
    }
  }

  function openScanSourcePicker() {
    Alert.alert("Scan food", "Choose a photo source", [
      {
        text: "Camera",
        onPress: () => void pickAndAnalyzeWithGemini("camera"),
      },
      {
        text: "Photo library",
        onPress: () => void pickAndAnalyzeWithGemini("library"),
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

  if (isLoading) {
    return (
      <View style={s.loadingWrap}>
        <ActivityIndicator size="large" color={T.gold} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Date nav ── */}
        <View style={s.dateNavWrap}>
          <TouchableOpacity
            onPress={() => setDaysBack((p) => Math.min(MAX_DAYS_BACK, p + 1))}
            disabled={daysBack >= MAX_DAYS_BACK}
            style={[s.dateArrowBtn, daysBack >= MAX_DAYS_BACK && s.dimmed]}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={14} color={T.sub} />
          </TouchableOpacity>

          <View style={s.datePill}>
            <Ionicons name="calendar-outline" size={10} color={T.muted} />
            <Text style={s.datePillText}>{dateLabel}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setDaysBack((p) => Math.max(0, p - 1))}
            disabled={daysBack === 0}
            style={[s.dateArrowBtn, daysBack === 0 && s.dimmed]}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-forward" size={14} color={T.sub} />
          </TouchableOpacity>
        </View>

        {/* ── Calorie card ── */}
        <View style={s.calCard}>
          <View style={s.calStatsRow}>
            {/* Left: percentage */}
            <View style={s.calLeft}>
              <Text style={[s.calPct, isOver && s.calPctOver]}>{pct}%</Text>
              <Text style={s.calEatenLabel}>EATEN</Text>
            </View>

            <View style={s.calMidDivider} />

            {/* Right: cal breakdown */}
            <View style={s.calRight}>
              <Text style={s.calCategoryLabel}>CALORIES</Text>
              <View style={s.calValueRow}>
                <Text style={s.calCurrent}>{totalCal.toLocaleString()}</Text>
                <Text style={s.calGoalText}> / {goalCal.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Bottom: remaining badge + track */}
          <View style={s.calBottom}>
            <View style={[s.calBadge, isOver && s.calBadgeOver]}>
              <Ionicons
                name="flash"
                size={11}
                color={isOver ? T.red : T.gold}
              />
              <Text style={[s.calBadgeText, isOver && s.calBadgeTextOver]}>
                {isOver
                  ? `${Math.abs(remaining).toLocaleString()} kcal over`
                  : `${remaining.toLocaleString()} kcal left`}
              </Text>
            </View>
            <View style={s.calTrack}>
              <View
                style={[
                  s.calFill,
                  {
                    width: `${pct}%`,
                    backgroundColor: isOver ? T.red : T.gold,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* ── Macro grid ── */}
        <View style={s.macroGrid}>
          <MacroCell label="PROTEIN" current={totalP} goal={goalP} />
          <MacroCell label="CARBS" current={totalC} goal={goalC} />
          <MacroCell label="FAT" current={totalF} goal={goalF} />
        </View>

        {/* ── Log Food CTA ── */}
        <TouchableOpacity
          style={s.logFoodBtn}
          activeOpacity={0.85}
          onPress={() => setShowAddFood(true)}
        >
          <Ionicons name="add" size={18} color={T.bg0} />
          <Text style={s.logFoodBtnText}>Log Food</Text>
        </TouchableOpacity>

        {/* ── Meals section ── */}
        <View style={s.mealsHeader}>
          <Text style={s.sectionTitle}>TODAY'S MEALS</Text>
          <TouchableOpacity
            onPress={() => setShowAddFood(true)}
            activeOpacity={0.75}
          >
            <Text style={s.addMoreLinkText}>+ Add</Text>
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
                onDelete={(id) => deleteMeal(id)}
              />
            );
          })}

        {mealLog?.length === 0 && (
          <View style={s.emptyMeals}>
            <Ionicons name="restaurant-outline" size={28} color={T.muted} />
            <Text style={s.emptyMealsText}>No meals logged</Text>
            <Text style={s.emptyMealsSub}>Tap Log Food to get started</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Add food modal ── */}
      <Modal visible={showAddFood} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />

            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Add Food</Text>
              <TouchableOpacity
                onPress={() => setShowAddFood(false)}
                style={s.sheetCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={16} color={T.sub} />
              </TouchableOpacity>
            </View>

            {/* Meal type chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.mealTypeScroll}
            >
              {MEAL_TYPES.map((t) => {
                const active = mealType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setMealType(t)}
                    activeOpacity={0.75}
                    style={[s.mealTypeChip, active && s.mealTypeChipActive]}
                  >
                    <Ionicons
                      name={MEAL_ICONS[t] ?? "restaurant-outline"}
                      size={13}
                      color={active ? T.bg0 : T.muted}
                    />
                    <Text
                      style={[s.mealTypeText, active && s.mealTypeTextActive]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView
              style={s.modalBodyScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Menu step */}
              {entryStep === "menu" && (
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
              )}

              {/* Analyzing step */}
              {entryStep === "analyzing" && (
                <View style={s.analyzingWrap}>
                  <ActivityIndicator size="large" color={T.gold} />
                  <Text style={s.analyzingText}>Analyzing food…</Text>
                </View>
              )}

              {/* Form step */}
              {entryStep === "form" && (
                <View style={s.manualForm}>
                  {geminiError && (
                    <Text style={s.geminiErrorText}>{geminiError}</Text>
                  )}

                  {(
                    [
                      {
                        label: "Food name",
                        value: manualName,
                        setter: setManualName,
                        keyboard: "default" as const,
                        placeholder: "e.g. Chicken breast",
                      },
                      {
                        label: "Calories",
                        value: manualCal,
                        setter: setManualCal,
                        keyboard: "numeric" as const,
                        placeholder: "0",
                      },
                      {
                        label: "Protein (g)",
                        value: manualP,
                        setter: setManualP,
                        keyboard: "numeric" as const,
                        placeholder: "0",
                      },
                      {
                        label: "Carbs (g)",
                        value: manualC,
                        setter: setManualC,
                        keyboard: "numeric" as const,
                        placeholder: "0",
                      },
                      {
                        label: "Fat (g)",
                        value: manualF,
                        setter: setManualF,
                        keyboard: "numeric" as const,
                        placeholder: "0",
                      },
                    ] as const
                  ).map(({ label, value, setter, keyboard, placeholder }) => (
                    <View key={label}>
                      <Text style={s.formLabel}>{label}</Text>
                      <TextInput
                        value={value}
                        onChangeText={setter}
                        placeholder={placeholder}
                        placeholderTextColor={T.muted}
                        style={s.formInput}
                        keyboardType={keyboard}
                      />
                    </View>
                  ))}

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
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },

  // Date nav
  dateNavWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14,
  },
  dateArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
    // No border
  },
  dimmed: { opacity: 0.3 },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.bg3,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  datePillText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 0.5,
  },

  // Calorie card
  calCard: {
    backgroundColor: T.bg2,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    gap: 16,
  },
  calStatsRow: { flexDirection: "row", alignItems: "center" },
  calLeft: { alignItems: "center", gap: 4, paddingRight: 4, minWidth: 80 },
  calPct: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 52,
    lineHeight: 54,
    letterSpacing: -2,
    color: T.gold, // Gold percentage
  },
  calPctOver: { color: T.red },
  calEatenLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 1.5,
  },
  calMidDivider: {
    width: 1,
    height: 56,
    backgroundColor: T.bg3, // Subtle divider
    marginHorizontal: 18,
  },
  calRight: { flex: 1, gap: 4 },
  calCategoryLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 1.2,
  },
  calValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "nowrap",
  },
  calCurrent: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 40,
    color: T.text,
    lineHeight: 42,
    letterSpacing: -1,
  },
  calGoalText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: T.muted,
    lineHeight: 20,
    marginLeft: 2,
  },

  // Badge + track
  calBottom: { gap: 10 },
  calBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: T.gold + "18",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  calBadgeOver: { backgroundColor: T.red + "18" },
  calBadgeText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold,
    letterSpacing: 0.3,
  },
  calBadgeTextOver: { color: T.red },
  calTrack: {
    height: 4,
    backgroundColor: T.bg3,
    borderRadius: 2,
    overflow: "hidden",
  },
  calFill: { height: "100%", borderRadius: 2 },

  // Macro grid — all gold fills, no per-macro color
  macroGrid: { flexDirection: "row", gap: 10, marginBottom: 14 },
  macroCell: {
    flex: 1,
    backgroundColor: T.bg2,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 4,
  },
  macroCellValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 22,
    lineHeight: 24,
    color: T.text,
    letterSpacing: -0.5,
  },
  macroCellGoal: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    lineHeight: 12,
  },
  macroCellTrack: {
    width: "100%",
    height: 3,
    backgroundColor: T.bg3,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  macroCellFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: T.gold, // Unified gold fill
    shadowColor: T.gold,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  macroCellLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.0,
    marginTop: 2,
  },

  // Log Food CTA — solid gold
  logFoodBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.gold,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 24,
  },
  logFoodBtnText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 16,
    color: T.bg0,
    letterSpacing: 0.5,
  },

  // Meals header
  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.sub,
    letterSpacing: 1.5,
  },
  addMoreLinkText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.gold,
  },

  // Meal group card
  mealGroup: {
    backgroundColor: T.bg2,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  mealGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealGroupLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  mealIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: T.bg3, // Neutral bg, gold icon
    alignItems: "center",
    justifyContent: "center",
  },
  mealGroupName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.text,
    letterSpacing: 0.3,
  },
  mealCalBadge: {
    backgroundColor: T.bg3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mealCalBadgeText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.sub,
    letterSpacing: 0.2,
  },

  // Food rows
  itemDivider: { height: 1, backgroundColor: T.bg3, marginVertical: 8 },
  foodRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  foodRowLeft: { flex: 1, gap: 2 },
  foodName: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.text,
  },
  foodMacros: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  foodCalWrap: { alignItems: "flex-end" },
  foodCal: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 16,
    color: T.gold,
    lineHeight: 18,
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
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty state
  emptyMeals: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyMealsText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.sub,
  },
  emptyMealsSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
  },

  // Modal sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: T.bg2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "92%",
    // No border
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
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 22,
    color: T.text,
    letterSpacing: 0.5,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },

  // Meal type chips
  mealTypeScroll: { gap: 8, paddingBottom: 16 },
  mealTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: T.bg3,
    // No border on inactive
  },
  mealTypeChipActive: { backgroundColor: T.gold },
  mealTypeText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
  },
  mealTypeTextActive: { color: T.bg0, fontFamily: "DMSans_400Regular" },

  // Entry steps
  modalBodyScroll: { maxHeight: 420 },
  entryMenu: { gap: 12, paddingBottom: 8 },
  scanPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.gold,
    paddingVertical: 15,
    borderRadius: 14,
  },
  scanPrimaryBtnText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 16,
    color: T.bg0,
    letterSpacing: 0.5,
  },
  manualSecondaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: T.bg3,
  },
  manualSecondaryBtnText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.sub,
  },
  analyzingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 14,
  },
  analyzingText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.muted,
  },

  // Manual form
  manualForm: { gap: 8, paddingBottom: 12 },
  geminiErrorText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.red,
    marginBottom: 8,
    lineHeight: 18,
  },
  formLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    marginTop: 6,
    marginBottom: 2,
  },
  formInput: {
    backgroundColor: T.bg3,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.text,
    // No border
  },
  addToLogBtn: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: T.gold,
  },
  addToLogBtnDisabled: { opacity: 0.4 },
  addToLogBtnText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 16,
    color: T.bg0,
    letterSpacing: 0.5,
  },
  formBackBtn: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  formBackBtnText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.muted,
  },
});
