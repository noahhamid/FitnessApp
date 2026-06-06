import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = { name: string; date?: string; duration?: string; sets?: number };

export function PRCard({ name, date, duration, sets }: Props) {
  return (
    <View style={s.card}>
      <View style={s.iconBadge}>
        <Ionicons name="barbell-outline" size={22} color={COLORS.accent} />
      </View>

      <View style={s.middle}>
        <Text style={s.name}>{name}</Text>
        {date ? <Text style={s.date}>{date}</Text> : null}
      </View>

      <View style={s.right}>
        {duration ? <Text style={s.duration}>{duration}</Text> : null}
        {sets != null ? (
          <Text style={s.sets}>{sets} sets</Text>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },

  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${COLORS.accent}15`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
    alignItems: "center",
    justifyContent: "center",
  },

  middle: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    letterSpacing: 0.1,
  },
  date: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 0.2,
  },

  right: {
    alignItems: "flex-end",
    gap: 3,
  },
  duration: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.text,
    letterSpacing: 0.1,
  },
  sets: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 0.2,
  },
});
