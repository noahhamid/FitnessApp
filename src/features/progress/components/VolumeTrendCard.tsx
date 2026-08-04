import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";
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

  const { bars, last, first } = useMemo(() => {
    const max = Math.max(...series.map((p) => p.volumeKg), 1);
    const padX = 6;
    const padTop = 8;
    const baselineY = height - 8;
    const usableW = width - padX * 2;
    const usableH = baselineY - padTop;
    const gap = 4;
    const barW =
      series.length > 0
        ? Math.max(6, (usableW - gap * (series.length - 1)) / series.length)
        : 0;

    const next = series.map((p, i) => {
      const barH =
        p.volumeKg > 0 ? Math.max(3, (p.volumeKg / max) * usableH) : 0;
      return {
        x: padX + i * (barW + gap),
        y: baselineY - barH,
        width: barW,
        height: barH,
        isLast: i === series.length - 1,
      };
    });

    return {
      bars: next,
      last: series[series.length - 1]?.volumeKg ?? 0,
      first: series[0]?.volumeKg ?? 0,
    };
  }, [series]);

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
          <Line
            x1={0}
            y1={height - 8}
            x2={width}
            y2={height - 8}
            stroke={T.border}
            strokeWidth={1}
          />
          {bars.map((bar, i) =>
            bar.height > 0 ? (
              <Rect
                key={i}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={3}
                fill={bar.isLast ? T.accent : T.accent}
                opacity={bar.isLast ? 1 : 0.45}
              />
            ) : null,
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
