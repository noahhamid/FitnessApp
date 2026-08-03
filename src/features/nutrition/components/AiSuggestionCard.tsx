import { Sparkles } from "lucide-react-native";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { PressableScale } from "./PressableScale";

type Suggestion = { label: string; calories: number };

type Props = {
  headline: string;
  body: string;
  imageUrl: string;
  suggestions: Suggestion[];
  onSelect: (s: Suggestion) => void;
};

export function AiSuggestionCard({
  headline,
  body,
  imageUrl,
  suggestions,
  onSelect,
}: Props) {
  const { T, styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: imageUrl }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(9,9,12,0.05)", "rgba(9,9,12,0.32)", "rgba(9,9,12,0.90)"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/*
        Content sits in normal flow (not absolutely positioned from the
        bottom) so the card's minHeight grows to fit however much text
        there is. A fixed card height + bottom-pinned absolute content
        was clipping long headlines/bodies/wrapped chips against the top
        edge via overflow:hidden — this removes that ceiling entirely.
      */}
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

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      minHeight: 220,
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: T.glass,
      justifyContent: "flex-end",
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 18,
      elevation: 3,
    },
    content: {
      paddingHorizontal: 18,
      paddingTop: 40,
      paddingBottom: 16,
    },
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
      color: T.onImage,
      lineHeight: 22,
      marginBottom: 6,
      maxWidth: "92%",
      textShadowColor: "rgba(0,0,0,0.35)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 6,
    },
    body: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.onImageMuted,
      lineHeight: 17,
      marginBottom: 13,
      maxWidth: "94%",
    },
    row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    chipPressable: { borderRadius: 999 },
    chip: {
      backgroundColor: T.onImageGlass,
      borderWidth: 1,
      borderColor: T.onImageBorder,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 13,
    },
    chipText: { fontFamily: T.bodySemi, fontSize: 11, color: T.onImage },
  });
}
