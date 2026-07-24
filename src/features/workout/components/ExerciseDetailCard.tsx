import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { LibraryExercise } from "../hooks/useExerciseLibrary";

const T = {
  bg: "#000000",
  panel: "#15161C",
  panelBorder: "rgba(255,255,255,0.08)",
  accent: "#FFC700",
  accentText: "#1A1300",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",
  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodyBold: "Inter_700Bold",
};

type Props = {
  exercise: LibraryExercise;
  imageUrl: string;
  onBack: () => void;
  onStart: () => void;
  onAddToToday: () => void;
  addedToToday?: boolean;
};

export function ExerciseDetailCard({
  exercise,
  imageUrl,
  onBack,
  onStart,
  onAddToToday,
  addedToToday,
}: Props) {
  return (
    <SafeAreaView style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={s.heroWrap}>
          <Image
            source={{ uri: imageUrl }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <View style={s.heroOverlay} />
          <Pressable style={s.backBtn} onPress={onBack} hitSlop={8}>
            <ChevronLeft size={20} color={T.white} />
          </Pressable>
        </View>

        <View style={s.content}>
          <View style={s.tagPill}>
            <Text style={s.tagText}>{exercise.muscleGroup}</Text>
          </View>
          <Text style={s.title}>{exercise.name}</Text>

          <View style={s.metaRow}>
            <View style={s.metaChip}>
              <Text style={s.metaLabel}>PATTERN</Text>
              <Text style={s.metaValue}>{exercise.movementPattern}</Text>
            </View>
            <View style={s.metaChip}>
              <Text style={s.metaLabel}>EQUIPMENT</Text>
              <Text style={s.metaValue}>
                {exercise.minEquipment.replace("_", " ")}
              </Text>
            </View>
          </View>

          <Pressable style={s.primaryBtn} onPress={onStart}>
            <Text style={s.primaryBtnText}>Start this exercise</Text>
          </Pressable>

          <Pressable
            style={[s.secondaryBtn, addedToToday && s.secondaryBtnDone]}
            onPress={onAddToToday}
            disabled={addedToToday}
          >
            <Text style={s.secondaryBtnText}>
              {addedToToday
                ? "Added to today's session ✓"
                : "Add to today's session"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  heroWrap: { height: 220, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backBtn: {
    position: "absolute",
    top: 12,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,199,0,0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  tagText: {
    fontFamily: T.bodyBold,
    fontSize: 10,
    color: T.accent,
    textTransform: "capitalize",
  },
  title: {
    fontFamily: T.display,
    fontSize: 26,
    color: T.white,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  metaRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  metaChip: {
    flex: 1,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  metaLabel: {
    fontFamily: T.bodyBold,
    fontSize: 9,
    letterSpacing: 1,
    color: T.muted,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: T.display,
    fontSize: 13,
    color: T.white,
    textTransform: "capitalize",
  },
  primaryBtn: {
    backgroundColor: T.accent,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryBtnText: {
    fontFamily: T.bodyBold,
    fontSize: 14.5,
    color: T.accentText,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryBtnDone: { borderColor: T.accent },
  secondaryBtnText: { fontFamily: T.bodyBold, fontSize: 14, color: T.white },
});
