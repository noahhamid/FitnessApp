import { StyleSheet, Text, View } from "react-native";
import { Activity, Bike, Footprints, HeartPulse, Waves, Zap } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import type {
  ConditioningModality,
  ConditioningPlan,
} from "@/src/lib/conditioning-plan";

const MODALITY_ICON: Record<ConditioningModality, typeof Activity> = {
  bike: Bike,
  row: Waves,
  elliptical: Activity,
  brisk_walk: Footprints,
  bodyweight_circuit: Zap,
};

export function ConditioningCard({ plan }: { plan: ConditioningPlan }) {
  const { T, styles: s } = useThemedStyles(makeStyles);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.iconWrap}>
          <HeartPulse size={17} color={T.accent} strokeWidth={2.1} />
        </View>
        <View style={s.headerCopy}>
          <Text style={s.title}>Conditioning</Text>
          <Text style={s.meta}>
            {plan.sessionsPerWeek}× / week · {plan.weeklyMinutes} min total
          </Text>
        </View>
      </View>

      <Text style={s.rationale}>{plan.rationale}</Text>

      <View style={s.sessions}>
        {plan.sessions.map((session, i) => {
          const Icon = MODALITY_ICON[session.modality] ?? Activity;
          return (
            <View key={`${session.label}-${i}`} style={s.session}>
              <View style={s.sessionIcon}>
                <Icon size={14} color={T.accent} strokeWidth={2.2} />
              </View>
              <View style={s.sessionCopy}>
                <View style={s.sessionTop}>
                  <Text style={s.sessionLabel}>{session.label}</Text>
                  <Text style={s.sessionMinutes}>{session.minutes} min</Text>
                </View>
                <Text style={s.sessionDetail}>{session.detail}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={s.footnote}>
        Slot these on rest days, or after lifting — never before.
      </Text>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: T.glass,
      borderRadius: T.radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
      padding: 14,
      gap: 12,
    },
    header: { flexDirection: "row", alignItems: "center", gap: 10 },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: T.accentTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.accentLine,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCopy: { flex: 1, gap: 2 },
    title: { fontFamily: T.displaySemi, fontSize: 15, color: T.white },
    meta: {
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      color: T.faint,
      fontVariant: ["tabular-nums"],
    },
    rationale: {
      fontFamily: T.bodyMed,
      fontSize: 12.5,
      lineHeight: 18,
      color: T.muted,
    },
    sessions: { gap: 10 },
    session: { flexDirection: "row", gap: 10 },
    sessionIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    sessionCopy: { flex: 1, gap: 3 },
    sessionTop: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 8,
    },
    sessionLabel: { fontFamily: T.bodySemi, fontSize: 13, color: T.white },
    sessionMinutes: {
      fontFamily: T.bodyBold,
      fontSize: 11.5,
      color: T.accent,
      fontVariant: ["tabular-nums"],
    },
    sessionDetail: {
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      lineHeight: 16.5,
      color: T.faint,
    },
    footnote: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.faint,
      fontStyle: "italic",
    },
  });
}
