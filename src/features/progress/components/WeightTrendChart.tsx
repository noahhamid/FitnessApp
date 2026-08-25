import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { Scale } from "lucide-react-native";
import type { WeightLogEntry } from "../hooks/useProgress";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";

interface Props {
  entries: WeightLogEntry[]; // ascending by date, last 8 weeks worth
  height?: number;
  goalKg?: number | null;
}

export function WeightTrendChart({ entries, height = 140, goalKg }: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const width = 320; // logical width, SVG scales via viewBox anyway
  const hasGoal = goalKg != null && Number.isFinite(goalKg);

  const { points, minW, maxW, goalY } = useMemo(() => {
    if (entries.length === 0)
      return {
        points: [] as { x: number; y: number }[],
        minW: 0,
        maxW: 0,
        goalY: null as number | null,
      };

    const weights = entries.map((e) => e.weight);
    if (hasGoal) weights.push(goalKg as number);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 1; // avoid divide-by-zero for a flat line

    const padX = 12;
    const padY = 16;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    const pts = entries.map((e, i) => {
      const x =
        padX +
        (entries.length === 1
          ? usableW / 2
          : (i / (entries.length - 1)) * usableW);
      const y = padY + usableH - ((e.weight - min) / range) * usableH;
      return { x, y };
    });

    const nextGoalY = hasGoal
      ? padY + usableH - (((goalKg as number) - min) / range) * usableH
      : null;

    return { points: pts, minW: min, maxW: max, goalY: nextGoalY };
  }, [entries, goalKg, hasGoal, height]);

  if (entries.length === 0) {
    return (
      <GlassSurface style={[s.card, s.emptyCard]}>
        <View style={s.emptyIcon}>
          <Scale size={22} color={T.accent} strokeWidth={2.2} />
        </View>
        <Text style={s.emptyTitle}>No weigh-ins yet</Text>
        <Text style={s.emptyText}>
          Log your weight to start a trend — even one entry is enough to begin.
        </Text>
      </GlassSurface>
    );
  }

  const linePath = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`),
    "",
  );
  const fillPath = `${linePath} L${points[points.length - 1].x},${height - 16} L${points[0].x},${height - 16} Z`;

  const first = entries[0].weight;
  const last = entries[entries.length - 1].weight;
  const delta = last - first;

  return (
    <GlassSurface style={s.card}>
      <View style={s.headerRow}>
        <View>
          <Text style={s.eyebrow}>WEIGHT TREND</Text>
          <Text style={s.currentWeight}>{last.toFixed(1)} kg</Text>
          <Text style={s.deltaText}>
            {delta === 0
              ? "No change over this period"
              : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg since first log`}
          </Text>
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="weightFillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={T.accent} stopOpacity="0.18" />
            <Stop offset="1" stopColor={T.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* baseline */}
        <Line
          x1={0}
          y1={height - 16}
          x2={width}
          y2={height - 16}
          stroke={T.border}
          strokeWidth={1}
        />

        {goalY != null && hasGoal ? (
          <>
            <Line
              x1={12}
              y1={goalY}
              x2={width - 12}
              y2={goalY}
              stroke={T.muted}
              strokeWidth={1.25}
              strokeDasharray="5,4"
            />
            <SvgText
              x={width - 12}
              y={goalY - 5}
              fill={T.muted}
              fontSize={10}
              fontFamily={T.bodyMed}
              textAnchor="end"
            >
              {`Goal ${Number(goalKg).toFixed(1)} kg`}
            </SvgText>
          </>
        ) : null}

        <Path d={fillPath} fill="url(#weightFillGrad)" />
        <Path
          d={linePath}
          stroke={T.accent}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 4 : 2.5}
            fill={T.accent}
          />
        ))}
      </Svg>

      <View style={s.rangeRow}>
        <Text style={s.rangeText}>Low {minW.toFixed(1)}</Text>
        <Text style={s.rangeText}>High {maxW.toFixed(1)}</Text>
      </View>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.lg,
      padding: T.space.lg,
    },
    emptyCard: {
      alignItems: "center",
      paddingVertical: 36,
      gap: 8,
    },
    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    emptyTitle: {
      fontFamily: T.displaySemi,
      fontSize: 16,
      color: T.white,
    },
    headerRow: { marginBottom: T.space.sm, zIndex: 1 },
    eyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 1.1,
      color: T.muted,
      marginBottom: 6,
    },
    currentWeight: {
      fontFamily: T.displayBold,
      fontSize: 32,
      color: T.white,
      letterSpacing: -0.8,
    },
    deltaText: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
      marginTop: 2,
    },
    rangeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      zIndex: 1,
    },
    rangeText: { fontFamily: T.bodyMed, fontSize: 11, color: T.muted },
    emptyText: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.muted,
      textAlign: "center",
      lineHeight: 19,
      paddingHorizontal: 12,
    },
  });
}
