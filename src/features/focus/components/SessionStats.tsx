import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

// Fixed: import directly from tokens, NOT from @/src/theme
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";

// ── Types ─────────────────────────────────────────────────────────────────────

type DayStat = {
  day: string;
  sessions: number;
  minutes: number;
};

type Props = {
  weekData?: DayStat[];
  totalSessions?: number;
  totalMinutes?: number;
  streak?: number;
  avgMinutes?: number;
};

// ── Default data (replace with real store/hook) ───────────────────────────────

const DEFAULT_WEEK: DayStat[] = [
  { day: "M", sessions: 2, minutes: 50 },
  { day: "T", sessions: 1, minutes: 25 },
  { day: "W", sessions: 3, minutes: 75 },
  { day: "T", sessions: 0, minutes: 0 },
  { day: "F", sessions: 2, minutes: 50 },
  { day: "S", sessions: 1, minutes: 25 },
  { day: "S", sessions: 0, minutes: 0 },
];

// ── Mini bar chart ────────────────────────────────────────────────────────────

const BAR_W = 24;
const BAR_GAP = 8;
const BAR_H = 56;

function WeekBarChart({ data }: { data: DayStat[] }) {
  const maxMin = Math.max(...data.map((d) => d.minutes), 1);
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const chartW = data.length * BAR_W + (data.length - 1) * BAR_GAP;

  return (
    <View style={s.chartWrap}>
      <Svg width={chartW} height={BAR_H}>
        {data.map((d, i) => {
          const barH =
            d.minutes > 0 ? Math.max((d.minutes / maxMin) * (BAR_H - 8), 6) : 4;
          const x = i * (BAR_W + BAR_GAP);
          const y = BAR_H - barH;
          const isToday = i === todayIdx;
          const color = isToday
            ? COLORS.accent
            : d.minutes > 0
              ? COLORS.border
              : COLORS.bg3;

          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={BAR_W}
              height={barH}
              rx={6}
              fill={color}
              opacity={d.minutes > 0 ? 1 : 0.4}
            />
          );
        })}
      </Svg>

      {/* Day labels */}
      <View style={[s.dayLabels, { width: chartW }]}>
        {data.map((d, i) => {
          const isToday =
            i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
          return (
            <Text
              key={i}
              style={[
                s.dayLabel,
                isToday && { color: COLORS.accent, fontFamily: FONTS.bold },
              ]}
            >
              {d.day}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

type StatTileProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string;
  label: string;
};

function StatTile({ iconName, iconColor, value, label }: StatTileProps) {
  return (
    <View style={s.statTile}>
      <View style={[s.statIconWrap, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={iconName} size={16} color={iconColor} />
      </View>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SessionStats({
  weekData = DEFAULT_WEEK,
  totalSessions = 9,
  totalMinutes = 225,
  streak = 4,
  avgMinutes = 25,
}: Props) {
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const timeStr =
    totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMinutes}m`;

  const weekSessions = weekData.reduce((acc, d) => acc + d.sessions, 0);

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIconWrap}>
            <Ionicons name="stats-chart" size={16} color={COLORS.accent} />
          </View>
          <View>
            <Text style={s.title}>SESSION STATS</Text>
            <Text style={s.subtitle}>This week's focus summary</Text>
          </View>
        </View>

        {/* Streak badge */}
        {streak > 0 && (
          <View style={s.streakBadge}>
            <Ionicons name="flame" size={13} color={COLORS.orange} />
            <Text style={s.streakText}>{streak} day streak</Text>
          </View>
        )}
      </View>

      {/* Stat tiles */}
      <View style={s.tilesRow}>
        <StatTile
          iconName="time-outline"
          iconColor={COLORS.accent}
          value={timeStr}
          label="TOTAL TIME"
        />
        <StatTile
          iconName="checkmark-circle-outline"
          iconColor={COLORS.blue}
          value={String(totalSessions)}
          label="SESSIONS"
        />
        <StatTile
          iconName="trending-up-outline"
          iconColor={COLORS.orange}
          value={`${avgMinutes}m`}
          label="AVG LENGTH"
        />
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Weekly bar chart */}
      <View style={s.chartSection}>
        <View style={s.chartHeader}>
          <Text style={s.chartTitle}>THIS WEEK</Text>
          <Text style={s.chartSub}>
            {weekSessions} session{weekSessions !== 1 ? "s" : ""}
          </Text>
        </View>
        <WeekBarChart data={weekData} />
      </View>

      {/* Best day callout */}
      {(() => {
        const best = weekData.reduce(
          (a, b) => (b.minutes > a.minutes ? b : a),
          weekData[0],
        );
        if (!best.minutes) return null;
        return (
          <View style={s.bestDay}>
            <Ionicons name="trophy-outline" size={13} color={COLORS.accent} />
            <Text style={s.bestDayText}>
              Best day this week —{" "}
              <Text style={{ color: COLORS.accent }}>
                {best.minutes} min focused
              </Text>
            </Text>
          </View>
        );
      })()}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 14,
    color: COLORS.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 1,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.orange}18`,
    borderWidth: 1,
    borderColor: `${COLORS.orange}35`,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  streakText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.orange,
  },
  tilesRow: {
    flexDirection: "row",
    gap: 8,
  },
  statTile: {
    flex: 1,
    backgroundColor: COLORS.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  statVal: {
    fontFamily: FONTS.black,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  chartSection: { gap: 12 },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 2,
  },
  chartSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
  },
  chartWrap: { alignItems: "center", gap: 8 },
  dayLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.muted,
    width: BAR_W,
    textAlign: "center",
  },
  bestDay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${COLORS.accent}10`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}25`,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bestDayText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    flex: 1,
  },
});
