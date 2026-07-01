import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const T = {
  bg: "#121212",
  card: "#1E1E1E",
  gold: "#FFC700",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  dim: "#3A3A3A",
  border: "#FFFFFF0D",
};

type Props = {
  name: string;
  date?: string;
  duration?: string;
  sets?: number;
};

export function PRCard({ name, date, duration, sets }: Props) {
  return (
    <View style={s.card}>
      {/* Icon — naked, no tinted container */}
      <Ionicons name="barbell-outline" size={18} color={T.dim} />

      {/* Name + date */}
      <View style={s.middle}>
        <Text style={s.name} numberOfLines={1}>
          {name}
        </Text>
        {date ? <Text style={s.date}>{date}</Text> : null}
      </View>

      {/* Duration + sets — all muted, no gold */}
      <View style={s.right}>
        {duration ? (
          <View style={s.durationRow}>
            <Ionicons name="timer-outline" size={11} color={T.dim} />
            <Text style={s.durationText}>{duration}</Text>
          </View>
        ) : null}
        {sets != null ? <Text style={s.sets}>{sets} sets</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  middle: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.text,
    letterSpacing: 0.3,
  },
  date: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  right: {
    alignItems: "flex-end",
    gap: 4,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.sub, // was T.gold — duration is metadata, not an achievement
    letterSpacing: 0.3,
  },
  sets: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
});
