import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { AntDesign } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
  onGoogle: () => void;
  onApple: () => void;
  googleLoading?: boolean;
  appleLoading?: boolean;
  disabled?: boolean;
};

/** Official-style multicolor Google "G". */
function GoogleGlyph({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

/**
 * Shared Google + Apple CTAs for sign-in / sign-up.
 * Pill-shaped, brand colors, brand icons.
 */
export function SocialAuthButtons({
  onGoogle,
  onApple,
  googleLoading = false,
  appleLoading = false,
  disabled = false,
}: Props) {
  const { styles: s } = useOnboardingStyles(makeStyles);
  const busy = disabled || googleLoading || appleLoading;
  const [appleAvailable, setAppleAvailable] = useState(Platform.OS === "ios");

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    let active = true;
    void import("expo-apple-authentication")
      .then((mod) => mod.isAvailableAsync())
      .then((available) => {
        if (active) setAppleAvailable(available);
      })
      .catch(() => {
        if (active) setAppleAvailable(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={s.stack}>
      <Pressable
        disabled={busy}
        style={({ pressed }) => [
          s.btn,
          s.googleBtn,
          busy && s.disabled,
          pressed && !busy && s.pressed,
        ]}
        onPress={onGoogle}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        {googleLoading ? (
          <ActivityIndicator color="#1F1F1F" size="small" />
        ) : (
          <View style={s.row}>
            <GoogleGlyph />
            <Text style={s.googleText}>Continue with Google</Text>
          </View>
        )}
      </Pressable>

      {appleAvailable ? (
        <Pressable
          disabled={busy}
          style={({ pressed }) => [
            s.btn,
            s.appleBtn,
            busy && s.disabled,
            pressed && !busy && s.pressed,
          ]}
          onPress={onApple}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          {appleLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={s.row}>
              <AntDesign name="apple" size={20} color="#FFFFFF" />
              <Text style={s.appleText}>Continue with Apple</Text>
            </View>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
    stack: {
      gap: 12,
      marginBottom: 18,
    },
    btn: {
      height: 52,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    googleBtn: {
      backgroundColor: "#FFFFFF",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    appleBtn: {
      backgroundColor: "#000000",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    googleText: {
      fontFamily: FONTS.semiBold,
      fontSize: 15,
      color: "#1F1F1F",
      letterSpacing: 0.2,
    },
    appleText: {
      fontFamily: FONTS.semiBold,
      fontSize: 15,
      color: "#FFFFFF",
      letterSpacing: 0.2,
    },
    disabled: {
      opacity: 0.45,
    },
    pressed: {
      opacity: 0.88,
    },
  });
}
