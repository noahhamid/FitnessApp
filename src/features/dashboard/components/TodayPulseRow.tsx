import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { AppIcon } from "@/src/components/AppIcon";
import { GlassSurface } from "./GlassSurface";

type Props = {
  /** Planned session minutes (null on rest / unknown). */
  plannedMinutes: number | null;
  /** Completed minutes when a session finished; null if not done. */
  completedMinutes: number | null;
  workoutDone: boolean;
  isRestDay: boolean;
  streakDays: number;
};

export function TodayPulseRow({
  plannedMinutes,
  completedMinutes,
  workoutDone,
  isRestDay,
  streakDays,
}: Props) {
  const { styles: s } = useThemedStyles(makeStyles);

  let durationValue: string;
  let durationLabel: string;
  if (isRestDay) {
    durationValue = "Rest";
    durationLabel = "Today";
  } else if (workoutDone) {
    durationValue =
      completedMinutes != null ? `${completedMinutes}′` : "Done";
    durationLabel = "Trained";
  } else if (plannedMinutes != null) {
    durationValue = `${plannedMinutes}′`;
    durationLabel = "Planned";
  } else {
    durationValue = "—";
    durationLabel = "Session";
  }

  return (
    <View style={s.row}>
      <GlassSurface style={s.tile}>
        <View style={s.iconWell}>
          <AppIcon name="clock" size={28} />
        </View>
        <View style={s.copy}>
          <Text style={s.value}>{durationValue}</Text>
          <Text style={s.label}>{durationLabel}</Text>
        </View>
      </GlassSurface>

      <GlassSurface style={s.tile}>
        <View style={s.iconWell}>
          <AppIcon name="streak" size={28} />
        </View>
        <View style={s.copy}>
          <Text style={s.value}>{streakDays}</Text>
          <Text style={s.label}>Day streak</Text>
        </View>
      </GlassSurface>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      gap: 10,
    },
    tile: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: T.radius.lg,
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    iconWell: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    copy: { flex: 1, gap: 1 },
    value: {
      fontFamily: T.displaySemi,
      fontSize: 18,
      color: T.white,
      fontVariant: ["tabular-nums"],
      letterSpacing: -0.3,
    },
    label: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.faint,
    },
  });
}
