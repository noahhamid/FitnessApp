import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Check, Dumbbell, Info, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LibraryExercise } from "../hooks/useExerciseLibrary";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { bottomInset, topInset } from "@/src/lib/safe-area";
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
  const { height: winH } = useWindowDimensions();
  const safeTop = topInset(insets.top);
  const bottomPad = tabContentBottomPad(insets.bottom);
  const [howtoOpen, setHowtoOpen] = useState(false);

  // Cap hero so title + meta + tip + CTAs stay on one screen (no scroll).
  const heroH = Math.round(
    Math.min(220, Math.max(140, winH * 0.28 - safeTop)),
  );

  const allSteps = useMemo(
    () => parseInstructionSteps(exercise.instructions),
    [exercise.instructions],
  );
  const allTips = useMemo(
    () => tipsForPattern(exercise.movementPattern),
    [exercise.movementPattern],
  );
  const previewStep = allSteps[0];
  const hasHowto = allSteps.length > 0 || allTips.length > 0;

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
    <View style={[s.screen, { paddingBottom: bottomPad }]}>
      <View style={[s.heroWrap, { height: heroH + safeTop + 8 }]}>
        <Image
          source={{ uri: imageUrl }}
          style={[s.heroImage, { top: safeTop + 8, height: heroH }]}
          resizeMode="contain"
        />
        <LinearGradient
          colors={["rgba(14,14,16,0.04)", "transparent", T.bg]}
          locations={[0, 0.55, 1]}
          style={[s.heroGradient, { top: safeTop + 8, height: heroH }]}
          pointerEvents="none"
        />
        <Pressable
          style={[s.backBtn, { top: safeTop + 6 }]}
          onPress={onBack}
          hitSlop={8}
        >
          <ChevronLeft size={20} color={T.onImage} />
        </Pressable>
      </View>

      <View style={s.body}>
        <View style={s.tagPill}>
          <Text style={s.tagText}>{exercise.muscleGroup}</Text>
        </View>
        <Text style={s.title} numberOfLines={2}>
          {exercise.name}
        </Text>

        <View style={s.metaRow}>
          <View style={s.metaChip}>
            <Dumbbell size={13} color={T.accent} strokeWidth={2.2} />
            <Text style={s.metaLabel}>Movement</Text>
            <Text style={s.metaValue} numberOfLines={1}>
              {formatPatternLabel(exercise.movementPattern)}
            </Text>
          </View>
          <View style={s.metaChip}>
            <Info size={13} color={T.accent} strokeWidth={2.2} />
            <Text style={s.metaLabel}>Equipment</Text>
            <Text style={s.metaValue} numberOfLines={1}>
              {formatEquipmentLabel(exercise.minEquipment)}
            </Text>
          </View>
        </View>

        {hasHowto && (
          <Pressable
            style={s.aboutCard}
            onPress={() => setHowtoOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="View full how to perform"
          >
            <View style={s.aboutHeader}>
              <Text style={s.aboutLabel}>How to</Text>
              <Text style={s.moreLink}>More</Text>
            </View>
            {previewStep ? (
              <Text style={s.aboutLine} numberOfLines={2}>
                <Text style={s.aboutIndex}>1. </Text>
                {previewStep}
              </Text>
            ) : allTips[0] ? (
              <Text style={s.aboutLine} numberOfLines={2}>
                {allTips[0].body}
              </Text>
            ) : null}
            {(allSteps.length > 1 || allTips.length > 0) && (
              <Text style={s.aboutHint}>
                Tap for full steps
                {allSteps.length > 1 ? ` (${allSteps.length})` : ""}
              </Text>
            )}
          </Pressable>
        )}

        <View style={s.spacer} />

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
                    numberOfLines={1}
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

      <Modal
        visible={howtoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setHowtoOpen(false)}
      >
        <View style={s.modalRoot}>
          <Pressable
            style={s.modalBackdrop}
            onPress={() => setHowtoOpen(false)}
            accessibilityLabel="Close how to"
          />
          <View
            style={[
              s.modalSheet,
              { paddingBottom: bottomInset(insets.bottom) + 16 },
            ]}
          >
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle} numberOfLines={2}>
                How to — {exercise.name}
              </Text>
              <Pressable
                style={s.modalClose}
                onPress={() => setHowtoOpen(false)}
                hitSlop={8}
              >
                <X size={18} color={T.text} strokeWidth={2.2} />
              </Pressable>
            </View>
            <ScrollView
              style={s.modalScroll}
              contentContainerStyle={s.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {allSteps.length > 0 ? (
                <>
                  <Text style={s.modalSection}>Steps</Text>
                  {allSteps.map((step, index) => (
                    <View
                      key={`${index}-${step.slice(0, 16)}`}
                      style={s.stepRow}
                    >
                      <View style={s.stepBadge}>
                        <Text style={s.stepBadgeText}>{index + 1}</Text>
                      </View>
                      <Text style={s.stepText}>{step}</Text>
                    </View>
                  ))}
                </>
              ) : null}
              {allTips.length > 0 ? (
                <>
                  <Text
                    style={[
                      s.modalSection,
                      allSteps.length > 0 && s.modalSectionSpaced,
                    ]}
                  >
                    Form tips
                  </Text>
                  {allTips.map((t, index) => (
                    <Text
                      key={`${index}-${t.body.slice(0, 16)}`}
                      style={s.tipText}
                    >
                      {t.title ? (
                        <Text style={s.tipTitle}>{t.title}: </Text>
                      ) : null}
                      {t.body}
                    </Text>
                  ))}
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
      left: 16,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: T.onImageGlass,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    body: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 4,
    },
    spacer: { flex: 1, minHeight: 4 },
    tagPill: {
      alignSelf: "flex-start",
      backgroundColor: T.accentTint,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginBottom: 6,
    },
    tagText: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      color: T.accent,
      textTransform: "capitalize",
    },
    title: {
      fontFamily: T.displayBold,
      fontSize: 24,
      color: T.white,
      letterSpacing: -0.5,
      lineHeight: 28,
      marginBottom: 10,
    },
    metaRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
    metaChip: {
      flex: 1,
      backgroundColor: T.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 10,
      alignItems: "flex-start",
      gap: 2,
    },
    metaLabel: {
      fontFamily: T.bodyBold,
      fontSize: 9,
      letterSpacing: 0.8,
      color: T.muted,
      textTransform: "uppercase",
      marginTop: 1,
    },
    metaValue: {
      fontFamily: T.displaySemi,
      fontSize: 13,
      color: T.white,
    },
    aboutCard: {
      backgroundColor: T.bgElevated,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 4,
    },
    aboutHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    aboutLabel: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 0.9,
      color: T.accent,
      textTransform: "uppercase",
    },
    moreLink: {
      fontFamily: T.bodyBold,
      fontSize: 12,
      color: T.accent,
    },
    aboutIndex: {
      fontFamily: T.bodyBold,
      color: T.accent,
    },
    aboutLine: {
      fontFamily: T.body,
      fontSize: 13,
      lineHeight: 18,
      color: T.white,
    },
    aboutHint: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.muted,
      marginTop: 2,
    },
    actions: { gap: 8, paddingTop: 8 },
    primaryBtn: {
      backgroundColor: T.accent,
      borderRadius: 999,
      paddingVertical: 14,
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
      paddingVertical: 13,
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

    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    modalSheet: {
      backgroundColor: T.bgElevated,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
      borderBottomWidth: 0,
      maxHeight: "78%",
      paddingTop: 10,
      paddingHorizontal: 18,
    },
    modalHandle: {
      alignSelf: "center",
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: T.border,
      marginBottom: 12,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 12,
    },
    modalTitle: {
      flex: 1,
      fontFamily: T.displayBold,
      fontSize: 18,
      lineHeight: 22,
      color: T.white,
      letterSpacing: -0.3,
    },
    modalClose: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: T.bg,
      alignItems: "center",
      justifyContent: "center",
    },
    modalScroll: { flexGrow: 0 },
    modalScrollContent: { paddingBottom: 8, gap: 10 },
    modalSection: {
      fontFamily: T.bodyBold,
      fontSize: 11,
      letterSpacing: 0.9,
      color: T.accent,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    modalSectionSpaced: { marginTop: 10 },
    stepRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    stepBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    stepBadgeText: {
      fontFamily: T.bodyBold,
      fontSize: 11,
      color: T.accent,
    },
    stepText: {
      flex: 1,
      fontFamily: T.body,
      fontSize: 14.5,
      lineHeight: 21,
      color: T.white,
    },
    tipText: {
      fontFamily: T.body,
      fontSize: 14.5,
      lineHeight: 21,
      color: T.white,
    },
    tipTitle: {
      fontFamily: T.bodyBold,
      color: T.accent,
    },
  });
}
