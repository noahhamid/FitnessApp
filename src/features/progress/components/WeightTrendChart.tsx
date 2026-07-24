import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import type { WeightLogEntry } from "../hooks/useProgress";

const T = {
  panel: "#15161C",
  panelBorder: "rgba(255,255,255,0.08)",
  accent: "#FFC700",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.5)",
  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
};

interface Props {
  entries: WeightLogEntry[]; // ascending by date, last 8 weeks worth
  height?: number;
}

export function WeightTrendChart({ entries, height = 140 }: Props) {
  const width = 320; // logical width, SVG scales via viewBox anyway

  const { points, minW, maxW } = useMemo(() => {
    if (entries.length === 0)
      return { points: [] as { x: number; y: number }[], minW: 0, maxW: 0 };

    const weights = entries.map((e) => e.weight);
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

    return { points: pts, minW: min, maxW: max };
  }, [entries, height]);

  if (entries.length === 0) {
    return (
      <View
        style={[
          s.card,
          { height, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={s.emptyText}>No weight logged yet</Text>
      </View>
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
    <View style={s.card}>
      <View style={s.headerRow}>
        <View>
          <Text style={s.currentWeight}>{last.toFixed(1)} kg</Text>
          <Text style={s.deltaText}>
            {delta === 0
              ? "No change"
              : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg since start`}
          </Text>
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="weightFillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={T.accent} stopOpacity="0.25" />
            <Stop offset="1" stopColor={T.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* baseline */}
        <Line
          x1={0}
          y1={height - 16}
          x2={width}
          y2={height - 16}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />

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
        <Text style={s.rangeText}>{minW.toFixed(1)} kg</Text>
        <Text style={s.rangeText}>{maxW.toFixed(1)} kg</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: T.panel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 16,
  },
  headerRow: { marginBottom: 8 },
  currentWeight: {
    fontFamily: T.display,
    fontSize: 24,
    color: T.white,
    letterSpacing: -0.5,
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
    marginTop: 4,
  },
  rangeText: { fontFamily: T.bodyMed, fontSize: 10, color: T.muted },
  emptyText: { fontFamily: T.bodyMed, fontSize: 13, color: T.muted },
});
