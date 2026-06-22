import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
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
      {/* Left accent stripe */}
      <View style={s.stripe} />

      {/* Icon */}
      <View style={s.iconWrap}>
        <Ionicons name="barbell-outline" size={20} color={T.lime} />
      </View>

      {/* Name + date */}
      <View style={s.middle}>
        <Text style={s.name} numberOfLines={1}>
          {name}
        </Text>
        {date ? <Text style={s.date}>{date}</Text> : null}
      </View>

      {/* Duration + sets */}
      <View style={s.right}>
        {duration ? (
          <View style={s.durationPill}>
            <Ionicons name="timer-outline" size={11} color={T.lime} />
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
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    overflow: "hidden",
    paddingRight: 14,
  },
  stripe: {
    width: 3,
    alignSelf: "stretch",
    backgroundColor: T.lime,
    opacity: 0.7,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: T.lime + "18",
    borderWidth: 1,
    borderColor: T.lime + "30",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
  },
  middle: {
    flex: 1,
    gap: 3,
    paddingVertical: 14,
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
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.lime + "18",
    borderWidth: 1,
    borderColor: T.lime + "30",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.lime,
    letterSpacing: 0.3,
  },
  sets: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
});
