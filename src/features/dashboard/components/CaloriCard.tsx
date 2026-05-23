import {
  NUTRITION_GOALS,
} from "@/src/features/nutrition/services/nutrition.service";
import {
  useDailyTotals,
  useNutritionGoals,
} from "@/src/features/nutrition/hooks/useNutrition";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RingChart } from "./DashboardComponents";

const T = {
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
  lime: "#C8F135",
  blue: "#3D8EFF",
  orange: "#FF8A00",
  red: "#FF3D3D",
  purple: "#9B6DFF",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
};

export function CalorieCard() {
  const { data: goals } = useNutritionGoals();
  const {
    data: totals,
    isPending: totalsPending,
  } = useDailyTotals();

  const goalCal =
    typeof goals?.calories === "number" ? goals.calories : NUTRITION_GOALS.calories;
  const goalProt =
    typeof goals?.protein === "number" ? goals.protein : NUTRITION_GOALS.protein;
  const goalCarbs =
    typeof goals?.carbs === "number" ? goals.carbs : NUTRITION_GOALS.carbs;
  const goalFat =
    typeof goals?.fat === "number" ? goals.fat : NUTRITION_GOALS.fat;

  const eaten = totals?.cal ?? 0;
  const burned = 0;

  const MACROS = [
    {
      label: "Protein",
      value: totals?.protein ?? 0,
      max: goalProt || 1,
      color: T.blue,
      icon: "💪",
    },
    {
      label: "Carbs",
      value: totals?.carbs ?? 0,
      max: goalCarbs || 1,
      color: T.orange,
      icon: "⚡",
    },
    {
      label: "Fat",
      value: totals?.fat ?? 0,
      max: goalFat || 1,
      color: T.red,
      icon: "🔥",
    },
  ];

  const net = eaten - burned;

  const remaining = goalCal - net;

  const pct =
    goalCal > 0 ? Math.min(Math.round((net / goalCal) * 100), 100) : 0;

  const isOver = remaining < 0;

  const ringColor = pct >= 100 ? T.red : pct >= 75 ? T.orange : T.lime;

  // Status chip
  const status =
    pct >= 100
      ? { label: "OVER GOAL", color: T.red }
      : pct >= 75
        ? { label: "ALMOST THERE", color: T.orange }
        : { label: "ON TRACK", color: T.lime };

  return (
    <View style={s.card}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>TODAY'S NUTRITION</Text>
          <Text style={s.subtitle}>Net = eaten − burned</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {totalsPending ? (
            <ActivityIndicator size="small" color={T.lime} />
          ) : null}
        <View
          style={[
            s.statusChip,
            {
              backgroundColor: status.color + "18",
              borderColor: status.color + "35",
            },
          ]}
        >
          <View style={[s.statusDot, { backgroundColor: status.color }]} />
          <Text style={[s.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
        </View>
      </View>

      {/* ── Hero row: ring + stats ──────────────────────────────────────────── */}
      <View style={s.heroRow}>
        {/* Ring */}
        <View style={s.ringWrap}>
          <RingChart
            pct={pct}
            size={124}
            stroke={10}
            color={ringColor}
            label={`${net}`}
            sublabel="NET KCAL"
          />
          {/* Pct badge below ring */}
          <View
            style={[
              s.ringPctBadge,
              {
                backgroundColor: ringColor + "18",
                borderColor: ringColor + "30",
              },
            ]}
          >
            <Text style={[s.ringPctText, { color: ringColor }]}>{pct}%</Text>
          </View>
        </View>

        {/* Right stats */}
        <View style={s.statsCol}>
          {[
            { label: "Goal", value: goalCal, unit: "kcal", color: T.text },
            { label: "Eaten", value: eaten, unit: "kcal", color: T.lime },
            { label: "Burned", value: burned, unit: "kcal", color: T.orange },
            {
              label: remaining < 0 ? "Over" : "Remaining",
              value: Math.abs(remaining),
              unit: "kcal",
              color: isOver ? T.red : T.sub,
            },
          ].map(({ label, value, unit, color }, i, arr) => (
            <View key={label}>
              <View style={s.statRow}>
                <Text style={s.statLabel}>{label}</Text>
                <View style={s.statValueRow}>
                  <Text style={[s.statValue, { color }]}>
                    {(value ?? 0).toLocaleString()}
                  </Text>
                  <Text style={s.statUnit}>{unit}</Text>
                </View>
              </View>
              {i < arr.length - 1 && <View style={s.statDivider} />}
            </View>
          ))}
        </View>
      </View>

      {/* ── Macro bars ─────────────────────────────────────────────────────── */}
      <View style={s.macroSection}>
        <Text style={s.macroSectionTitle}>MACROS</Text>
        {MACROS.map((m) => {
          const mPct = Math.min(Math.round((m.value / m.max) * 100), 100);
          const mRemaining = m.max - m.value;
          const mIsOver = m.value > m.max;

          return (
            <View key={m.label} style={s.macroRow}>
              {/* Label side */}
              <View style={s.macroLeft}>
                <View
                  style={[
                    s.macroIconBadge,
                    { backgroundColor: m.color + "18" },
                  ]}
                >
                  <Text style={s.macroIcon}>{m.icon}</Text>
                </View>
                <View>
                  <Text style={s.macroLabel}>{m.label}</Text>
                  <Text style={s.macroRemaining}>
                    {mIsOver
                      ? `${m.value - m.max}g over`
                      : `${mRemaining}g left`}
                  </Text>
                </View>
              </View>

              {/* Bar + value */}
              <View style={s.macroRight}>
                <View style={s.macroValueRow}>
                  <Text style={[s.macroValue, { color: m.color }]}>
                    {m.value}g
                  </Text>
                  <Text style={s.macroMax}>/{m.max}g</Text>
                  <View
                    style={[
                      s.macroPctBadge,
                      {
                        backgroundColor: m.color + "15",
                        borderColor: m.color + "30",
                      },
                    ]}
                  >
                    <Text style={[s.macroPctText, { color: m.color }]}>
                      {mPct}%
                    </Text>
                  </View>
                </View>
                <View style={s.macroTrack}>
                  <View
                    style={[
                      s.macroFill,
                      {
                        width: `${mPct}%`,
                        backgroundColor: mIsOver ? T.red : m.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <View style={s.divider} />

      {/* ── Footer summary strip ───────────────────────────────────────────── */}
      <View style={s.footer}>
        {[
          { label: "Protein", value: `${MACROS[0].value}g`, color: T.blue },
          { label: "Carbs", value: `${MACROS[1].value}g`, color: T.orange },
          { label: "Fat", value: `${MACROS[2].value}g`, color: T.red },
          { label: "Complete", value: `${pct}%`, color: T.lime },
        ].map(({ label, value, color }) => (
          <View key={label} style={s.footerItem}>
            <Text style={[s.footerValue, { color }]}>{value}</Text>
            <Text style={s.footerLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ── Log food CTA ───────────────────────────────────────────────────── */}
      <TouchableOpacity style={s.logBtn} activeOpacity={0.8}>
        <Text style={s.logBtnText}>+ Log Food</Text>
      </TouchableOpacity>
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
    padding: 18,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  headerLeft: {
    gap: 3,
  },
  title: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.text,
    letterSpacing: 1.0,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    letterSpacing: 0.6,
  },

  // ── Hero row ────────────────────────────────────────────────────────────────
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 20,
  },
  ringWrap: {
    alignItems: "center",
    gap: 6,
  },
  ringPctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  ringPctText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    letterSpacing: 0.4,
  },
  statsCol: {
    flex: 1,
    gap: 0,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  statLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.muted,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  statValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    lineHeight: 17,
  },
  statUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  statDivider: {
    height: 1,
    backgroundColor: T.border,
  },

  // ── Macro section ────────────────────────────────────────────────────────────
  macroSection: {
    gap: 10,
    marginBottom: 16,
  },
  macroSectionTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 1.0,
    marginBottom: 2,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  macroLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    width: 110,
  },
  macroIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  macroIcon: {
    fontSize: 13,
  },
  macroLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: T.text,
  },
  macroRemaining: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
  },
  macroRight: {
    flex: 1,
    gap: 4,
  },
  macroValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  macroValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    lineHeight: 15,
  },
  macroMax: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    flex: 1,
  },
  macroPctBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  macroPctText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 9,
  },
  macroTrack: {
    height: 5,
    backgroundColor: T.bg3,
    borderRadius: 3,
    overflow: "hidden",
  },
  macroFill: {
    height: "100%",
    borderRadius: 3,
  },

  // ── Divider ──────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: T.border,
    marginBottom: 14,
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 14,
  },
  footerItem: {
    alignItems: "center",
    gap: 2,
  },
  footerValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 16,
  },
  footerLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
  },

  // ── Log btn ──────────────────────────────────────────────────────────────────
  logBtn: {
    backgroundColor: T.lime,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  logBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.bg1,
    letterSpacing: 0.5,
  },
});
