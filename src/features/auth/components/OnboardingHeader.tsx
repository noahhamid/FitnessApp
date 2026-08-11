import { C, FONTS } from "@/src/ui/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  headline: string;
  sub: string;
  onBack: () => void;
};

/**
 * Single-line italic headline. "YOUR" stays white; everything else is accent.
 * Newlines in the source string are collapsed to spaces.
 */
function ColoredHeadline({ headline }: { headline: string }) {
  const line = headline.replace(/\s*\n\s*/g, " ").trim();

  if (!/\bYOUR\b/i.test(line)) {
    return (
      <Text
        style={[s.headline, s.headlineRest]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        allowFontScaling={false}
      >
        {line}
      </Text>
    );
  }

  const parts = line.split(/(YOUR)/i);
  return (
    <Text
      style={s.headline}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
      allowFontScaling={false}
    >
      {parts.map((part, i) => {
        if (!part) return null;
        const isYour = /^YOUR$/i.test(part);
        return (
          <Text key={i} style={isYour ? s.headlineLead : s.headlineRest}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

/**
 * Shared header for every "question" onboarding screen: back control,
 * gradient band, headline/sub, and the brand mark.
 */
export function OnboardingHeader({ headline, sub, onBack }: Props) {
  return (
    <View style={s.headerWrap}>
      <LinearGradient
        colors={[C.bg, "#3A1818", C.accentDeep]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0.6 }}
        end={{ x: 1, y: 0 }}
        style={s.headerGradient}
      />

      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={onBack}
          style={({ pressed }) => [s.backBtn, pressed && s.backPressed]}
        >
          <ChevronLeft size={26} color={C.text} strokeWidth={2.4} />
        </Pressable>

        <View style={s.titleLogoRow}>
          <View style={s.titleTextGroup}>
            <ColoredHeadline headline={headline} />
            <Text style={s.sub} numberOfLines={2}>
              {sub}
            </Text>
          </View>

          <View style={s.logoContainer}>
            <Image
              source={require("@/assets/images/potentialpeak_logo_nobackground.jpg")}
              style={s.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  headerWrap: {
    position: "relative",
    zIndex: 5,
    elevation: 5,
    marginTop: 10,
    marginHorizontal: 14,
    marginBottom: 6,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: C.bg,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 14,
    zIndex: 1,
  },
  backBtn: {
    marginTop: 2,
    marginLeft: -6,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backPressed: {
    opacity: 0.7,
  },
  titleLogoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -4,
  },
  titleTextGroup: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  logoContainer: {
    height: 120,
    width: 120,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  headline: {
    fontFamily: FONTS.blackItalic,
    fontSize: 34,
    letterSpacing: -0.5,
  },
  headlineLead: {
    color: C.text,
    fontFamily: FONTS.blackItalic,
  },
  headlineRest: {
    color: C.accent,
    fontFamily: FONTS.blackItalic,
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    marginTop: 6,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
