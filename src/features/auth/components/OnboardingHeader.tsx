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
 * Render headline in black italic Condensed. The word "YOUR" stays white;
 * everything else is accent red. Headlines without "YOUR" fall back to a
 * white first line / red remainder split.
 */
function ColoredHeadline({ headline }: { headline: string }) {
  if (/\bYOUR\b/i.test(headline)) {
    const parts = headline.split(/(YOUR)/i);
    return (
      <Text style={s.headline}>
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

  const nl = headline.indexOf("\n");
  if (nl === -1) {
    return <Text style={[s.headline, s.headlineRest]}>{headline}</Text>;
  }

  return (
    <Text style={s.headline}>
      <Text style={s.headlineLead}>{headline.slice(0, nl)}</Text>
      {"\n"}
      <Text style={s.headlineRest}>{headline.slice(nl + 1)}</Text>
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
            <Text style={s.sub}>{sub}</Text>
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
    // Above meters/sliders that can sit near the title band (e.g. height).
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
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
    paddingRight: 8,
  },
  logoContainer: {
    height: 120,
    width: 120,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  headline: {
    fontFamily: FONTS.blackItalic,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  headlineLead: {
    color: C.text,
  },
  headlineRest: {
    color: C.accent,
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    marginTop: 6,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
