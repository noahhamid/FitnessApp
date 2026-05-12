import { View, Text, ScrollView, StyleSheet } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { COLORS, VOLUME_SPARKLINE } from "@/src/theme";

const C = COLORS;

function SparkLine({ data, color, W = 60, H = 28 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / rng) * (H - 4) - 2}`)
    .join(" ");
  return (
    <Svg width={W} height={H}>
      <Polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function HistoryCard({ session }) {
  return (
    <View style={s.historyCard}>
      <View style={s.historyTop}>
        <View>
          <Text style={s.historyName}>{session.name}</Text>
          <Text style={s.historyDate}>{session.date}</Text>
        </View>
        <SparkLine data={VOLUME_SPARKLINE} color={C.accent} />
      </View>
      <View style={s.historySummary}>
        {[
          [session.duration, "Duration"],
          [session.volume, "Volume"],
          [String(session.sets), "Sets"],
        ].map(([v, l]) => (
          <View key={l} style={s.historyStat}>
            <Text style={s.historyStatVal}>{v}</Text>
            <Text style={s.historyStatLabel}>{l}</Text>
          </View>
        ))}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingTop: 10 }}
      >
        {session.exercises.map((ex) => (
          <View key={ex} style={s.historyExTag}>
            <Text style={s.historyExTagText}>{ex}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  historyCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  historyName: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 18,
    color: C.text,
  },
  historyDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  historySummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  historyStat: {
    alignItems: "center",
  },
  historyStatVal: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 18,
    color: C.text,
  },
  historyStatLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: C.muted,
  },
  historyExTag: {
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  historyExTagText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: C.muted,
  },
});