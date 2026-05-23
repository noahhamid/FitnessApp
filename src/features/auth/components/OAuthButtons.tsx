import {
  signInWithApple,
  signInWithGoogle,
} from "@/src/features/auth/services/auth.service";
import { C, FONTS } from "@/src/theme";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = { onSuccess?: () => void };

function AppleIcon() {
  return <Text style={{ fontSize: 18, color: C.text, lineHeight: 22 }}></Text>;
}

function GoogleIcon() {
  return (
    <View style={s.gBadge}>
      <Text style={s.gText}>G</Text>
    </View>
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

      <View style={s.row}>
        <TouchableOpacity
          style={[s.btn, loading === "apple" && s.btnLoading]}
          onPress={handleApple}
          disabled={!!loading}
          activeOpacity={0.8}
        >
          {loading === "apple" ? (
            <ActivityIndicator size="small" color={C.text} />
          ) : (
            <>
              <AppleIcon />
              <Text style={s.btnText}>Apple</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, loading === "google" && s.btnLoading]}
          onPress={handleGoogle}
          disabled={!!loading}
          activeOpacity={0.8}
        >
          {loading === "google" ? (
            <ActivityIndicator size="small" color={C.text} />
          ) : (
            <>
              <GoogleIcon />
              <Text style={s.btnText}>Google</Text>
            </>
          )}
        </TouchableOpacity>
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

  row: { flexDirection: "row", gap: 12 },

  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: C.bg3,
  },
  btnLoading: { opacity: 0.6 },
  btnText: {
    fontFamily: FONTS.semiBold,
    color: C.text,
    fontSize: 14,
  },

  gBadge: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  gText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },

  errorText: {
    color: "red",
    fontSize: 12,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
});
