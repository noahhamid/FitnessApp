import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WorkoutRow } from "./DashboardComponents";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg1: "#111114",
  bg3: "#222228",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
  lime: "#C8F135",
  orange: "#FF8A00",
  blue: "#3D8EFF",
  purple: "#9B6DFF",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Session = {
  title: string;
  duration: string;
  sets: string;
  tag: string;
  tagColor: string;
};

type Props = {
  onSeeAll?: () => void;
  sessions?: Session[];
};

// ─── Default sessions ─────────────────────────────────────────────────────────
const DEFAULT_SESSIONS: Session[] = [
  {
    title: "Upper Body Strength",
    duration: "45 min",
    sets: "5 exercises",
    tag: "STRENGTH",
    tagColor: T.lime,
  },
  {
    title: "HIIT Cardio Blast",
    duration: "20 min",
    sets: "8 rounds",
    tag: "CARDIO",
    tagColor: T.orange,
  },
  {
    title: "Core & Mobility",
    duration: "15 min",
    sets: "4 exercises",
    tag: "RECOVERY",
    tagColor: T.blue,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function TodaySession({ onSeeAll, sessions = DEFAULT_SESSIONS }: Props) {
  const totalMins = sessions.reduce((acc, s) => acc + parseInt(s.duration), 0);
  const totalExercises = sessions.length;

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>TODAY'S PLAN</Text>
          <Text style={s.subtitle}>
            {totalExercises} sessions · {totalMins} min total
          </Text>
        </View>
        {onSeeAll ? (
          <TouchableOpacity
            onPress={onSeeAll}
            activeOpacity={0.7}
            style={s.seeAllBtn}
          >
            <Text style={s.seeAllText}>See all →</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Progress indicators row */}
      <View style={s.progressRow}>
        {sessions.map((session, i) => (
          <View
            key={i}
            style={[
              s.progressPill,
              {
                backgroundColor: session.tagColor,
                flex: parseInt(session.duration),
              },
            ]}
          />
        ))}
      </View>
      <Text style={s.progressLabel}>{totalMins} min planned · 0 completed</Text>

      {/* Workout rows */}
      <View style={s.rows}>
        {sessions.map((session, i) => (
          <WorkoutRow key={i} {...session} />
        ))}
      </View>

      {/* Start CTA */}
      <TouchableOpacity style={s.startBtn} activeOpacity={0.85}>
        <Text style={s.startBtnText}>START WORKOUT</Text>
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
    marginHorizontal: 16,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.text,
    letterSpacing: 1.0,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    marginTop: 3,
  },
  seeAllBtn: {
    backgroundColor: T.bg3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  seeAllText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: T.lime,
  },
  progressRow: {
    flexDirection: "row",
    gap: 3,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressPill: {
    height: "100%",
    borderRadius: 2,
    opacity: 0.75,
  },
  progressLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    marginBottom: 10,
  },
  rows: {
    // Last WorkoutRow border hidden since card has its own bottom
  },
  startBtn: {
    marginTop: 16,
    backgroundColor: T.lime,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  startBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: "#0A0A0C",
    letterSpacing: 1.2,
  },
});
