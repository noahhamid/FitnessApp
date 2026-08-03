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
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import type { WorkoutSessionSummary } from "../hooks/useProgress";
import { weeklyVolumeSeries } from "../lib/analytics";

type Props = {
  sessions: WorkoutSessionSummary[];
};

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)} kg`;
}

export function VolumeTrendCard({ sessions }: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const width = 300;
  const height = 110;

  const series = useMemo(() => weeklyVolumeSeries(sessions, 8), [sessions]);
  const hasData = series.some((p) => p.volumeKg > 0);

  const { points, last, first } = useMemo(() => {
    const max = Math.max(...series.map((p) => p.volumeKg), 1);
    const padX = 8;
    const padY = 12;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;
    const pts = series.map((p, i) => ({
      x:
        padX +
        (series.length === 1 ? usableW / 2 : (i / (series.length - 1)) * usableW),
      y: padY + usableH - (p.volumeKg / max) * usableH,
    }));
    return {
      points: pts,
      last: series[series.length - 1]?.volumeKg ?? 0,
      first: series[0]?.volumeKg ?? 0,
    };
  }, [series]);

  const linePath = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`),
    "",
  );
  const fillPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${height - 8} L${points[0].x},${height - 8} Z`
      : "";

  const delta = last - first;

  return (
    <GlassSurface style={s.card}>
      <Text style={s.eyebrow}>VOLUME · 8 WEEKS</Text>
      <View style={s.headerRow}>
        <Text style={s.hero}>{hasData ? formatVolume(last) : "—"}</Text>
        <Text style={s.sub}>
          {!hasData
            ? "Complete workouts to build this chart"
            : delta === 0
              ? "Flat vs first week"
              : `${delta > 0 ? "+" : ""}${formatVolume(Math.abs(delta))} vs first week`}
        </Text>
      </View>

      {hasData ? (
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <LinearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={T.accent} stopOpacity="0.28" />
              <Stop offset="1" stopColor={T.accent} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Line
            x1={0}
            y1={height - 8}
            x2={width}
            y2={height - 8}
            stroke={T.border}
            strokeWidth={1}
          />
          <Path d={fillPath} fill="url(#volFill)" />
          <Path
            d={linePath}
            stroke={T.accent}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.length > 0 && (
            <Circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={3.5}
              fill={T.accent}
            />
          )}
        </Svg>
      ) : (
        <View style={s.emptyChart}>
          <Text style={s.emptyText}>No volume logged yet</Text>
        </View>
      )}

      <View style={s.axisRow}>
        <Text style={s.axisLabel}>{series[0]?.label ?? ""}</Text>
        <Text style={s.axisLabel}>
          {series[series.length - 1]?.label ?? ""}
        </Text>
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
    eyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 0.8,
      color: T.muted,
      marginBottom: 8,
      zIndex: 1,
    },
    headerRow: { marginBottom: 10, zIndex: 1 },
    hero: {
      fontFamily: T.displayBold,
      fontSize: 26,
      color: T.white,
      letterSpacing: -0.4,
    },
    sub: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
      marginTop: 2,
    },
    emptyChart: {
      height: 110,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    emptyText: { fontFamily: T.bodyMed, fontSize: 12, color: T.faint },
    axisRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
      zIndex: 1,
    },
    axisLabel: { fontFamily: T.bodySemi, fontSize: 10, color: T.faint },
  });
}
