import { C, FONTS } from "@/src/ui/tokens";
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
  return (
    <View style={s.nav}>
      <Pressable
        disabled={nextDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: nextDisabled }}
        style={({ pressed }) => [
          s.nextBtn,
          nextDisabled && s.nextBtnDisabled,
          pressed && s.btnPressed,
        ]}
        onPress={onNext}
      >
        <Text
          style={s.nextText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          allowFontScaling={false}
        >
          {nextLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
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
    fontFamily: FONTS.bold,
    fontSize: 15,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
  btnPressed: {
    opacity: 0.85,
  },
});
