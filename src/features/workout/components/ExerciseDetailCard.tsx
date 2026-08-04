import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LibraryExercise } from "../hooks/useExerciseLibrary";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";

type Props = {
  exercise: LibraryExercise;
  imageUrl: string;
  onBack: () => void;
  onStart: () => void;
  onAddToToday: () => void;
  onRemoveFromToday: () => void;
  addedToToday?: boolean;
  starting?: boolean;
  /** When false, already-added state is inert (no remove). Default true. */
  allowRemove?: boolean;
  addLabel?: string;
  addedLabel?: string;
  addPending?: boolean;
  /** Hide primary "Start this exercise" (mid-workout add flow). */
  showStart?: boolean;
};

export function ExerciseDetailCard({
  exercise,
  imageUrl,
  onBack,
  onStart,
  onAddToToday,
  onRemoveFromToday,
  addedToToday,
  starting,
  allowRemove = true,
  addLabel = "Add to today's session",
  addedLabel = "Added — tap to remove",
  addPending = false,
  showStart = true,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  const secondaryDisabled =
    addPending || (addedToToday && !allowRemove);

  const onSecondaryPress = () => {
    if (secondaryDisabled) return;
    if (addedToToday) {
      onRemoveFromToday();
      return;
    }
    onAddToToday();
  };

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View style={s.heroWrap}>
          <Image
            source={{ uri: imageUrl }}
            style={s.heroImage}
            resizeMode="cover"
          />
          <View style={s.heroOverlay} />
          <Pressable
            style={[s.backBtn, { top: topInset(insets.top) + 8 }]}
            onPress={onBack}
            hitSlop={8}
          >
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

          {showStart && (
            <Pressable
              style={[s.primaryBtn, starting && s.primaryBtnDisabled]}
              onPress={onStart}
              disabled={starting}
            >
              {starting ? (
                <ActivityIndicator color={T.onAccent} size="small" />
              ) : (
                <Text style={s.primaryBtnText}>Start this exercise</Text>
              )}
            </Pressable>
          )}

          <Pressable
            style={[
              s.secondaryBtn,
              !showStart && s.secondaryBtnAsPrimary,
              addedToToday && s.secondaryBtnDone,
              secondaryDisabled && s.secondaryBtnDisabled,
            ]}
            onPress={onSecondaryPress}
            disabled={secondaryDisabled}
          >
            <View style={s.secondaryBtnContent}>
              {addPending ? (
                <ActivityIndicator
                  color={!showStart && !addedToToday ? T.onAccent : T.accent}
                  size="small"
                />
              ) : (
                <>
                  {addedToToday && (
                    <Check size={15} color={T.accent} strokeWidth={2.6} />
                  )}
                  <Text
                    style={[
                      s.secondaryBtnText,
                      !showStart && !addedToToday && s.secondaryBtnTextPrimary,
                      addedToToday && s.secondaryBtnTextDone,
                    ]}
                  >
                    {addedToToday
                      ? allowRemove
                        ? addedLabel
                        : "Already in this workout"
                      : addLabel}
                  </Text>
                </>
              )}
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  heroWrap: { height: 220, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.28)",
  },
  backBtn: {
    position: "absolute",
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
    backgroundColor: T.bgElevated,
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
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontFamily: T.bodyBold,
    fontSize: 14.5,
    color: T.onAccent,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryBtnAsPrimary: {
    backgroundColor: T.accent,
    borderColor: T.accent,
  },
  secondaryBtnDone: {
    borderColor: T.accent,
    backgroundColor: T.accentTint,
  },
  secondaryBtnDisabled: {
    opacity: 0.7,
  },
  secondaryBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secondaryBtnText: { fontFamily: T.bodyBold, fontSize: 14, color: T.white },
  secondaryBtnTextPrimary: { color: T.onAccent },
  secondaryBtnTextDone: { color: T.accent },
  });
}
