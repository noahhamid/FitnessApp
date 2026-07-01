import {
  signInWithApple,
  signInWithGoogle,
} from "@/src/features/auth/services/auth.service";
import { FONTS } from "@/src/ui/tokens/typography";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// --- Muscle Monster theme tokens ---
// Move into src/ui/tokens/colors.ts and export as `C` for app-wide reuse;
// kept local here so this file is drop-in ready and stays in sync with
// the values used in GoalsForm / ProfileMetricsForm.
const C = {
  bg: "#121212",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#FFC700",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

type Props = { onSuccess?: () => void };

// Strict monochrome glyphs — no brand colors. AppleIcon relies on the
// system SF Symbols private-use glyph (iOS/macOS render it as the Apple
// logo; Android will show a blank box, so swap in an SVG path if you
// support Android — see note below).
function AppleIcon() {
  return <Text style={s.appleGlyph}></Text>;
}

// Monochrome "G" mark — flat white ring, zero brand blue/red/green.
function GoogleIcon() {
  return (
    <View style={s.gBadge}>
      <Text style={s.gText}>G</Text>
    </View>
  );
}

// Shared button: handles press-scale + gold border glow animation.
function OAuthButton({
  icon,
  label,
  loading,
  disabled,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        speed: 40,
        bounciness: 6,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        speed: 40,
        bounciness: 6,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", C.accent],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          s.btn,
          { borderColor, transform: [{ scale }] },
          loading && s.btnLoading,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={C.text} />
        ) : (
          <>
            {icon}
            <Text style={s.btnText}>Continue with {label}</Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function OAuthButtons({ onSuccess }: Props) {
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApple() {
    try {
      setError(null);
      setLoading("apple");
      await signInWithApple();
      onSuccess?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Apple sign in failed.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    try {
      setError(null);
      setLoading("google");
      await signInWithGoogle();
      onSuccess?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Google sign in failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <View style={s.wrap}>
      <View style={s.dividerRow}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>OR CONTINUE WITH</Text>
        <View style={s.dividerLine} />
      </View>

      <View style={s.col}>
        <OAuthButton
          icon={<AppleIcon />}
          label="Apple"
          loading={loading === "apple"}
          disabled={!!loading}
          onPress={handleApple}
        />
        <OAuthButton
          icon={<GoogleIcon />}
          label="Google"
          loading={loading === "google"}
          disabled={!!loading}
          onPress={handleGoogle}
        />
      </View>

      {error && <Text style={s.errorText}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 16, marginTop: 8 },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: C.muted,
    fontFamily: FONTS.bold,
  },

  // Stacked full-width bars — matches the height/radius of the metric
  // inputs (paddingVertical 16-18, borderRadius 16) so the auth screen
  // feels continuous with the rest of onboarding.
  col: { gap: 12 },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: C.card,
  },
  btnLoading: { opacity: 0.6 },
  btnText: {
    fontFamily: FONTS.semiBold,
    color: C.text,
    fontSize: 15,
  },

  appleGlyph: {
    fontSize: 18,
    color: C.text,
    lineHeight: 22,
  },

  gBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.text,
    alignItems: "center",
    justifyContent: "center",
  },
  gText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.text,
  },

  errorText: {
    color: "#FF5C5C",
    fontSize: 12,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
});
