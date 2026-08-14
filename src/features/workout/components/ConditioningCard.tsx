import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Activity, Bike, Check, Footprints, HeartPulse, Waves, Zap } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import type {
  ConditioningModality,
  ConditioningPlan,
  ConditioningSession,
} from "@/src/lib/conditioning-plan";

const MODALITY_ICON: Record<ConditioningModality, typeof Activity> = {
  bike: Bike,
  row: Waves,
  elliptical: Activity,
  brisk_walk: Footprints,
  bodyweight_circuit: Zap,
};

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

type Props = {
  plan: ConditioningPlan;
  activeIndex?: number | null;
  elapsedSec?: number;
  saving?: boolean;
  completedIndexes?: ReadonlySet<number>;
  onStart: (session: ConditioningSession, index: number) => void;
  onComplete: () => void;
  onDiscard: () => void;
};

export function ConditioningCard({
  plan,
  activeIndex,
  elapsedSec = 0,
  saving = false,
  completedIndexes,
  onStart,
  onComplete,
  onDiscard,
}: Props) {
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
          const running = activeIndex === i;
          const done = completedIndexes?.has(i) ?? false;

          return (
            <View key={`${session.label}-${i}`} style={s.session}>
              <View style={s.sessionIcon}>
                {done ? (
                  <Check size={14} color={T.accent} strokeWidth={2.6} />
                ) : (
                  <Icon size={14} color={T.accent} strokeWidth={2.2} />
                )}
              </View>
              <View style={s.sessionCopy}>
                <View style={s.sessionTop}>
                  <Text style={s.sessionLabel}>{session.label}</Text>
                  <Text style={s.sessionMinutes}>
                    {running ? fmt(elapsedSec) : `${session.minutes} min`}
                  </Text>
                </View>
                <Text style={s.sessionDetail}>{session.detail}</Text>
                {running ? (
                  <View style={s.actions}>
                    <Pressable
                      onPress={onComplete}
                      disabled={saving}
                      style={s.primaryBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Mark conditioning complete"
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color={T.onAccent} />
                      ) : (
                        <Text style={s.primaryBtnText}>Done</Text>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={onDiscard}
                      disabled={saving}
                      style={s.ghostBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Discard conditioning timer"
                    >
                      <Text style={s.ghostBtnText}>Cancel</Text>
                    </Pressable>
                  </View>
                ) : done ? (
                  <Text style={s.doneHint}>Logged today</Text>
                ) : (
                  <Pressable
                    onPress={() => onStart(session, i)}
                    disabled={activeIndex != null}
                    style={[s.startBtn, activeIndex != null && s.startBtnDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel={`Start ${session.label}`}
                  >
                    <Text style={s.startBtnText}>Start</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <Text style={s.footnote}>
        Timer keeps running with the screen off. Mark done when you finish.
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
    actions: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
    primaryBtn: {
      backgroundColor: T.accent,
      borderRadius: T.radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minWidth: 72,
      alignItems: "center",
    },
    primaryBtnText: {
      fontFamily: T.bodyBold,
      fontSize: 12.5,
      color: T.onAccent,
    },
    ghostBtn: { paddingHorizontal: 10, paddingVertical: 8 },
    ghostBtnText: {
      fontFamily: T.bodyMed,
      fontSize: 12.5,
      color: T.muted,
    },
    startBtn: {
      alignSelf: "flex-start",
      marginTop: 6,
      backgroundColor: T.accentTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.accentLine,
      borderRadius: T.radius.pill,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    startBtnDisabled: { opacity: 0.4 },
    startBtnText: {
      fontFamily: T.bodyBold,
      fontSize: 12,
      color: T.accent,
    },
    doneHint: {
      marginTop: 4,
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.accent,
    },
    footnote: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.faint,
      fontStyle: "italic",
    },
  });
}
