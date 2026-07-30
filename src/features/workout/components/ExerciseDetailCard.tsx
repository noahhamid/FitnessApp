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
import { T } from "@/src/theme";

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
            <ChevronLeft size={20} color={T.onImage} />
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
            <Text
              style={[
                s.secondaryBtnText,
                addedToToday && s.secondaryBtnTextDone,
              ]}
            >
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
    backgroundColor: "rgba(10,10,10,0.28)",
  },
  backBtn: {
    position: "absolute",
    top: 12,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.onImageGlass,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: T.accentTint,
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
    fontFamily: T.displayBold,
    fontSize: 26,
    color: T.white,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  metaRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  metaChip: {
    flex: 1,
    backgroundColor: T.glass,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
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
    fontFamily: T.displaySemi,
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
    color: T.onImage,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryBtnDone: {
    borderColor: T.accent,
    backgroundColor: T.accentTint,
  },
  secondaryBtnText: { fontFamily: T.bodyBold, fontSize: 14, color: T.white },
  secondaryBtnTextDone: { color: T.accent },
});
