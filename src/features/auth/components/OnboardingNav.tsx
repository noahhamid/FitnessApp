import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
};

/** Shared continue CTA for onboarding question screens (back lives in the header). */
export function OnboardingNav({
  onNext,
  nextLabel = "CONTINUE",
  nextDisabled = false,
}: Props) {
  const { C, styles } = useOnboardingStyles(makeStyles);

  return (
    <View style={styles.nav}>
      <Pressable
        disabled={nextDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: nextDisabled }}
        style={({ pressed }) => [
          styles.nextBtn,
          nextDisabled && styles.nextBtnDisabled,
          pressed && styles.btnPressed,
        ]}
        onPress={onNext}
      >
        <Text
          style={styles.nextText}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {nextLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
    nav: {
      marginHorizontal: 24,
      zIndex: 1,
    },
    nextBtn: {
      paddingVertical: 18,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.accent,
      shadowColor: C.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    nextBtnDisabled: {
      opacity: 0.35,
      shadowOpacity: 0,
    },
    nextText: {
      fontFamily: FONTS.blackItalic,
      fontSize: 15,
      letterSpacing: 1,
      color: C.onAccent,
      textTransform: "uppercase",
      textAlign: "center",
    },
    btnPressed: {
      opacity: 0.85,
    },
  });
}
