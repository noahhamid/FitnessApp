import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Check, Dumbbell, Info } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LibraryExercise } from "../hooks/useExerciseLibrary";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";
import { tabContentBottomPad } from "@/src/lib/tab-chrome";
import {
  formatEquipmentLabel,
  formatPatternLabel,
  parseInstructionSteps,
  tipsForPattern,
} from "@/src/lib/exercise-instructions";

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

  const steps = useMemo(
    () => parseInstructionSteps(exercise.instructions),
    [exercise.instructions],
  );
  const tips = useMemo(
    () => tipsForPattern(exercise.movementPattern),
    [exercise.movementPattern],
  );

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
        contentContainerStyle={{
          paddingBottom: tabContentBottomPad(insets.bottom),
        }}
      >
        <View
          style={[
            s.heroWrap,
            { height: 300 + topInset(insets.top) + 52 },
          ]}
        >
          <Image
            source={{ uri: imageUrl }}
            style={[
              s.heroImage,
              { top: topInset(insets.top) + 52, height: 300 },
            ]}
            resizeMode="contain"
          />
          <LinearGradient
            colors={["rgba(14,14,16,0.06)", "transparent", T.bg]}
            locations={[0, 0.65, 1]}
            style={[
              s.heroGradient,
              { top: topInset(insets.top) + 52, height: 300 },
            ]}
          />
          <Pressable
            style={[s.backBtn, { top: topInset(insets.top) + 60 }]}
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
              <Dumbbell size={14} color={T.accent} strokeWidth={2.2} />
              <Text style={s.metaLabel}>Movement</Text>
              <Text style={s.metaValue}>
                {formatPatternLabel(exercise.movementPattern)}
              </Text>
            </View>
            <View style={s.metaChip}>
              <Info size={14} color={T.accent} strokeWidth={2.2} />
              <Text style={s.metaLabel}>Equipment</Text>
              <Text style={s.metaValue}>
                {formatEquipmentLabel(exercise.minEquipment)}
              </Text>
            </View>
          </View>

          {(steps.length > 0 || tips.length > 0) && (
            <View style={s.aboutCard}>
              {steps.length > 0 ? (
                <>
                  <Text style={s.aboutLabel}>How to perform</Text>
                  {steps.slice(0, 4).map((step, index) => (
                    <Text
                      key={`${index}-${step.slice(0, 12)}`}
                      style={s.aboutLine}
                      numberOfLines={2}
                    >
                      <Text style={s.aboutIndex}>{index + 1}. </Text>
                      {step}
                    </Text>
                  ))}
                </>
              ) : null}
              {tips.length > 0 ? (
                <>
                  <Text
                    style={[
                      s.aboutLabel,
                      steps.length > 0 && s.aboutLabelSpaced,
                    ]}
                  >
                    Form tip
                  </Text>
                  <Text style={s.aboutLine} numberOfLines={2}>
                    {tips[0].body}
                  </Text>
                </>
              ) : null}
            </View>
          )}

          <View style={s.actions}>
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
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: T.bg },
    heroWrap: {
      position: "relative",
      backgroundColor: T.bg,
      overflow: "hidden",
    },
    heroImage: { position: "absolute", left: 0, right: 0, width: "100%" },
    heroGradient: {
      position: "absolute",
      left: 0,
      right: 0,
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
    content: { paddingHorizontal: 20, paddingTop: 16 },
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
      fontSize: 28,
      color: T.white,
      letterSpacing: -0.6,
      lineHeight: 32,
      marginBottom: 18,
    },
    metaRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    metaChip: {
      flex: 1,
      backgroundColor: T.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: "flex-start",
      gap: 4,
    },
    metaLabel: {
      fontFamily: T.bodyBold,
      fontSize: 9,
      letterSpacing: 0.8,
      color: T.muted,
      textTransform: "uppercase",
      marginTop: 2,
    },
    metaValue: {
      fontFamily: T.displaySemi,
      fontSize: 14,
      color: T.white,
    },
    aboutCard: {
      backgroundColor: T.bgElevated,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 6,
      marginBottom: 18,
    },
    aboutLabel: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 0.9,
      color: T.accent,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    aboutLabelSpaced: {
      marginTop: 8,
    },
    aboutIndex: {
      fontFamily: T.bodyBold,
      color: T.accent,
    },
    aboutLine: {
      fontFamily: T.body,
      fontSize: 13.5,
      lineHeight: 19,
      color: T.white,
    },
    actions: { marginTop: 4, gap: 10 },
    primaryBtn: {
      backgroundColor: T.accent,
      borderRadius: 999,
      paddingVertical: 16,
      alignItems: "center",
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
