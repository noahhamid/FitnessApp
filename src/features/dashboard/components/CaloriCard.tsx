import { NUTRITION_GOALS } from "@/src/features/nutrition/services/nutrition.service";
import {
  useDailyTotals,
  useNutritionGoals,
} from "@/src/features/nutrition/hooks/useNutrition";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { RingChart } from "./DashboardComponents";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212", // page background
  bg1: "#1E1E1E", // card surface
  bg2: "#282828", // inset / track
  bg3: "#303030", // subtle divider fill
  border: "#FFFFFF0A",
  borderMid: "#FFFFFF14",
  gold: "#FFC700", // primary accent — ring, highlights, key values
  goldDim: "#FFC70030", // translucent gold for badges/tracks
  goldBorder: "#FFC70025",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#555555",
};

export function CalorieCard() {
  const { data: goals } = useNutritionGoals();
  const { data: totals, isPending: totalsPending } = useDailyTotals();

  const goalCal =
    typeof goals?.calories === "number"
      ? goals.calories
      : NUTRITION_GOALS.calories;
  const goalProt =
    typeof goals?.protein === "number"
      ? goals.protein
      : NUTRITION_GOALS.protein;
  const goalCarbs =
    typeof goals?.carbs === "number" ? goals.carbs : NUTRITION_GOALS.carbs;
  const goalFat =
    typeof goals?.fat === "number" ? goals.fat : NUTRITION_GOALS.fat;

  const eaten = totals?.cal ?? 0;
  const burned = 0;
  const net = eaten - burned;
  const remaining = goalCal - net;
  const pct =
    goalCal > 0 ? Math.min(Math.round((net / goalCal) * 100), 100) : 0;
  const isOver = remaining < 0;

  // Ring shifts to white at 100%+ so gold doesn't read as "success" when over
  const ringColor = pct >= 100 ? T.text : T.gold;

  const MACROS = [
    { label: "Protein", value: totals?.protein ?? 0, max: goalProt || 1 },
    { label: "Carbs", value: totals?.carbs ?? 0, max: goalCarbs || 1 },
    { label: "Fat", value: totals?.fat ?? 0, max: goalFat || 1 },
  ];

  return (
    <View style={s.card}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.title}>NUTRITION</Text>
        {totalsPending && <ActivityIndicator size="small" color={T.gold} />}
      </View>

      {/* ── Hero: ring + key stats ── */}
      <View style={s.heroRow}>
        {/* Ring */}
        <View style={s.ringWrap}>
          <RingChart
            pct={pct}
            size={128}
            stroke={11}
            color={ringColor}
            label={`${Math.abs(remaining).toLocaleString()}`}
            sublabel={isOver ? "KCAL OVER" : "KCAL LEFT"}
          />
          <View style={[s.pctPill, { borderColor: ringColor + "30" }]}>
            <Text style={[s.pctText, { color: ringColor }]}>{pct}%</Text>
          </View>
        </View>

        {/* Stats column */}
        <View style={s.statsCol}>
          {[
            { label: "Goal", value: goalCal, highlight: false },
            { label: "Eaten", value: eaten, highlight: true },
            { label: "Burned", value: burned, highlight: false },
          ].map(({ label, value, highlight }, i, arr) => (
            <View key={label}>
              <View style={s.statRow}>
                <Text style={s.statLabel}>{label}</Text>
                <View style={s.statValueRow}>
                  <Text style={[s.statValue, highlight && { color: T.gold }]}>
                    {(value ?? 0).toLocaleString()}
                  </Text>
                  <Text style={s.statUnit}>kcal</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>
      </View>

      {/* ── Macro bars ── */}
      <View style={s.macroSection}>
        <Text style={s.sectionLabel}>MACRONUTRIENTS</Text>
        {MACROS.map((m) => {
          const mPct = Math.min(Math.round((m.value / m.max) * 100), 100);
          const mIsOver = m.value > m.max;
          const mLeft = m.max - m.value;

          return (
            <View key={m.label} style={s.macroRow}>
              {/* Label + remainder */}
              <View style={s.macroMeta}>
                <Text style={s.macroLabel}>{m.label}</Text>
                <Text style={s.macroSub}>
                  {mIsOver
                    ? `${(m.value - m.max).toFixed(0)}g over`
                    : `${mLeft.toFixed(0)}g left`}
                </Text>
              </View>

              {/* Bar + value */}
              <View style={s.macroBarWrap}>
                <View style={s.macroTrack}>
                  <View
                    style={[
                      s.macroFill,
                      {
                        width: `${mPct}%`,
                        backgroundColor: mIsOver ? T.text : T.gold,
                        opacity: mIsOver ? 0.5 : 1,
                      },
                    ]}
                  />
                </View>
                <Text style={[s.macroValue, mIsOver && { color: T.sub }]}>
                  {m.value}
                  <Text style={s.macroMax}>/{m.max}g</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.borderMid,
    padding: 20,
    gap: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.sub,
    letterSpacing: 1.5,
  },

  // Hero row
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  ringWrap: {
    alignItems: "center",
    gap: 7,
  },
  pctPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: T.goldDim,
  },
  pctText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Stats column
  statsCol: {
    flex: 1,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
  },
  statLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  statValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
    lineHeight: 18,
  },
  statUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  divider: {
    height: 1,
    backgroundColor: T.border,
  },

  // Macros
  macroSection: {
    gap: 11,
  },
  sectionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  macroMeta: {
    width: 68,
    gap: 1,
  },
  macroLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: T.text,
  },
  macroSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
  },
  macroBarWrap: {
    flex: 1,
    gap: 4,
  },
  macroTrack: {
    height: 4,
    backgroundColor: T.bg2,
    borderRadius: 2,
    overflow: "hidden",
  },
  macroFill: {
    height: "100%",
    borderRadius: 2,
  },
  macroValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold,
    lineHeight: 15,
  },
  macroMax: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
});
