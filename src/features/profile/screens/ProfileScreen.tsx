import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useProfile } from "@/src/features/auth/hooks/useProfile";
import { signOut } from "@/src/features/auth";
import { COLORS, FONTS } from "@/src/theme";
import { Button } from "@/src/ui/components/Button";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const { user, isPending: authPending } = useAuth();
  const { data: metrics, isPending: profilePending } = useProfile();

  const loading = authPending || profilePending;
  const name = user?.name?.trim() || "Athlete";
  const email = user?.email?.trim() || "—";

  return (
    <View style={s.screen}>
      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      ) : null}
      <Text style={s.title}>PROFILE</Text>
      <Text style={s.name}>{name}</Text>
      <Text style={s.sub}>{email}</Text>
      <View style={s.metrics}>
        <Text style={s.metricsHead}>BODY PROFILE</Text>
        {metrics ? (
          <>
            <Text style={s.metricLine}>Weight · {metrics.weight_kg ?? 0}{" "}{metrics.weight_unit}</Text>
            <Text style={s.metricLine}>Height · {metrics.height_cm ?? 0} cm</Text>
            <Text style={s.metricLine}>Age · {metrics.age ?? "—"}</Text>
          </>
        ) : (
          <Text style={s.sub}>Add metrics during onboarding.</Text>
        )}
      </View>
      <Button
        outline
        onPress={async () => {
          await signOut();
          router.replace("/(auth)/welcome");
        }}
        style={{ marginTop: 24 }}
      >
        Sign out (dev)
      </Button>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, padding: 24, paddingTop: 52 },
  loader: { marginBottom: 12, alignItems: "flex-start" },
  title: { fontFamily: FONTS.black, fontSize: 32, color: COLORS.text },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginTop: 12,
  },
  sub: { fontFamily: FONTS.regular, color: COLORS.muted, marginTop: 6 },
  metrics: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg2,
    gap: 6,
  },
  metricsHead: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  metricLine: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.text },
});
