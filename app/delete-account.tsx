import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useDeleteAccount } from "@/src/features/auth/hooks/useAuth";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

/**
 * Deep link target for account-deletion confirmation emails:
 *   com.exo.fitness://delete-account?token=...
 * User must still be signed in; Better Auth validates token + session.
 */
export default function DeleteAccountConfirmScreen() {
  const { T, styles } = useThemedStyles(makeStyles);
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const tokenRaw = params.token;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;
  const deleteAccount = useDeleteAccount();
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!token || started) return;
    setStarted(true);
    deleteAccount.mutate(token, {
      onSuccess: (result) => {
        if (result.deleted) {
          router.replace("/(auth)/welcome");
          return;
        }
        setError(
          "Could not finish deleting your account. Open the email link again while signed in.",
        );
      },
      onError: (err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Could not delete account. Try again from Profile while signed in.",
        );
      },
    });
  }, [token, started, deleteAccount]);

  return (
    <View style={styles.screen}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator color={T.accent} />
          <Text style={styles.copy}>Deleting your account…</Text>
        </>
      )}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: T.bg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      gap: 12,
    },
    copy: {
      fontFamily: T.bodyMed,
      fontSize: 15,
      color: T.muted,
      textAlign: "center",
    },
    error: {
      fontFamily: T.bodyMed,
      fontSize: 15,
      color: T.badge,
      textAlign: "center",
    },
  });
}
