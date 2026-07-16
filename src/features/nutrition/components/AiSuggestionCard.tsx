import { Sparkles } from "lucide-react-native";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

type Suggestion = { label: string; calories: number };

type Props = {
  headline: string;
  body: string;
  imageUrl: string;
  suggestions: Suggestion[];
  onSelect: (s: Suggestion) => void;
};

// Same photo + gradient treatment as MealPhotoCard — a suggestion is still
// food, it deserves a photo rather than a plain text card.
export function AiSuggestionCard({
  headline,
  body,
  imageUrl,
  suggestions,
  onSelect,
}: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(9,9,12,0.05)", "rgba(9,9,12,0.35)", "rgba(9,9,12,0.94)"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <Sparkles size={12} color={T.accent} strokeWidth={2.2} />
          <Text style={styles.eyebrow}>AI SUGGESTION</Text>
        </View>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.body}>{body}</Text>

        <View style={styles.row}>
          {suggestions.map((s) => (
            <PressableScale
              key={s.label}
              onPress={() => onSelect(s)}
              scaleTo={0.96}
              style={styles.chipPressable}
            >
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {s.label} · {s.calories} Cal
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: T.bg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  image: { ...StyleSheet.absoluteFillObject },
  content: { position: "absolute", left: 18, right: 18, bottom: 16 },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  eyebrow: {
    fontFamily: T.bodyBold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: T.accent,
  },
  headline: {
    fontFamily: T.display,
    fontSize: 18,
    color: T.white,
    lineHeight: 22,
    marginBottom: 6,
    maxWidth: "92%",
  },
  body: {
    fontFamily: T.bodyMed,
    fontSize: 12,
    color: T.muted,
    lineHeight: 17,
    marginBottom: 13,
    maxWidth: "94%",
  },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chipPressable: { borderRadius: 999 },
  chip: {
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  chipText: { fontFamily: T.bodySemi, fontSize: 11, color: T.white },
});
