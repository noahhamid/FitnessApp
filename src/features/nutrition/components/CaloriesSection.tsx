import {
  FOOD_SEARCH,
  MEAL_LOG,
  NUTRITION_GOALS,
} from "@/src/features/nutrition/services/nutrition.service";
import { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

// ─── Meal type emoji map ──────────────────────────────────────────────────────
const MEAL_META: Record<string, { icon: string; color: string }> = {
  Breakfast: { icon: "🌅", color: T.orange },
  Snack: { icon: "🍎", color: T.lime },
  Lunch: { icon: "☀️", color: T.blue },
  Dinner: { icon: "🌙", color: "#9B6DFF" },
};

const MEAL_TYPES = ["Breakfast", "Snack", "Lunch", "Dinner"] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Stat column used in the hero row */
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

/** Single food item row inside a meal group */
function FoodRow({
  item,
}: {
  item: {
    id: string;
    name: string;
    cal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
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
    </View>
  );
}

/** Meal group card (Breakfast / Snack / Lunch / Dinner) */
function MealGroup({
  mealGroup,
  items,
}: {
  mealGroup: string;
  items: typeof MEAL_LOG;
}) {
  const meta = MEAL_META[mealGroup] ?? { icon: "🍽️", color: T.sub };
  const groupCal = items.reduce((a, m) => a + m.cal, 0);

  return (
    <View style={s.mealGroup}>
      {/* Group header */}
      <View style={s.mealGroupHeader}>
        <View style={s.mealGroupLeft}>
          <View style={[s.mealIconBox, { backgroundColor: meta.color + "1A" }]}>
            <Text style={s.mealIcon}>{meta.icon}</Text>
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

      {/* Food items */}
      {items.map((item, idx) => (
        <View key={item.id}>
          {idx > 0 && <View style={s.itemDivider} />}
          <FoodRow item={item} />
        </View>
      ))}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CaloriesSection() {
  const [showAddFood, setShowAddFood] = useState(false);
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState<string>("Breakfast");

  // Totals
  const totalCal = MEAL_LOG.reduce((a, m) => a + m.cal, 0);
  const remaining = NUTRITION_GOALS.calories - totalCal;
  const pct = Math.min(
    Math.round((totalCal / NUTRITION_GOALS.calories) * 100),
    100,
  );
  const isOver = remaining < 0;

  const totalP = MEAL_LOG.reduce((a, m) => a + m.protein, 0);
  const totalC = MEAL_LOG.reduce((a, m) => a + m.carbs, 0);
  const totalF = MEAL_LOG.reduce((a, m) => a + m.fat, 0);

  const filtered = FOOD_SEARCH.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
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

          {/* Divider */}
          <View style={s.heroDivider} />

          {/* Side stats */}
          <View style={s.heroStats}>
            <HeroStat
              label="Goal"
              value={NUTRITION_GOALS.calories}
              unit="kcal"
            />
            <View style={s.heroStatDivider} />
            <HeroStat
              label="Remaining"
              value={Math.abs(remaining)}
              unit={isOver ? "over" : "left"}
              color={isOver ? T.red : T.lime}
            />
            <View style={s.heroStatDivider} />
            <HeroStat
              label="Burned"
              value={NUTRITION_GOALS.caloriesBurned}
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
            goal={NUTRITION_GOALS.protein}
            color={T.blue}
          />
          <MacroBar
            label="Carbs"
            current={totalC}
            goal={NUTRITION_GOALS.carbs}
            color={T.orange}
          />
          <MacroBar
            label="Fat"
            current={totalF}
            goal={NUTRITION_GOALS.fat}
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
            <Text style={s.addFoodBtnText}>+ Add Food</Text>
          </TouchableOpacity>
        </View>

        {MEAL_TYPES.map((mealGroup) => {
          const items = MEAL_LOG.filter((m) => m.meal === mealGroup);
          if (!items.length) return null;
          return (
            <MealGroup key={mealGroup} mealGroup={mealGroup} items={items} />
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── ADD FOOD MODAL ──────────────────────────────────────────────────── */}
      <Modal visible={showAddFood} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.sheet}>
            {/* Handle */}
            <View style={s.sheetHandle} />

            {/* Header */}
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>ADD FOOD</Text>
              <TouchableOpacity
                onPress={() => setShowAddFood(false)}
                style={s.sheetCloseBtn}
                activeOpacity={0.7}
              >
                <Text style={s.sheetCloseText}>✕</Text>
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
                    <Text style={s.mealTypeIcon}>{meta.icon}</Text>
                    <Text style={[s.mealTypeText, active && { color: T.bg0 }]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Search */}
            <View style={s.searchBox}>
              <Text style={s.searchIcon}>🔍</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search food…"
                placeholderTextColor={T.muted}
                style={s.searchInput}
                autoCorrect={false}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Text style={s.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Food list */}
            <FlatList
              data={filtered}
              keyExtractor={(i) => i.id}
              style={s.foodList}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={s.listDivider} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.listItem}
                  activeOpacity={0.7}
                  onPress={() => setShowAddFood(false)}
                >
                  <View style={s.listItemLeft}>
                    <Text style={s.listItemName}>{item.name}</Text>
                    <Text style={s.listItemMacros}>
                      P {item.protein}g · C {item.carbs}g · F {item.fat}g
                    </Text>
                  </View>
                  <View style={s.listItemRight}>
                    <Text style={s.listItemCal}>{item.cal}</Text>
                    <Text style={s.listItemCalUnit}>kcal</Text>
                  </View>
                  <View style={s.listItemAdd}>
                    <Text style={s.listItemAddText}>+</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={s.emptyState}>
                  <Text style={s.emptyStateText}>
                    No results for "{search}"
                  </Text>
                </View>
              }
            />
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

  // Meal type chips
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

  // Search
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

  // Food list
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

  // Empty state
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyStateText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.muted,
  },
});
