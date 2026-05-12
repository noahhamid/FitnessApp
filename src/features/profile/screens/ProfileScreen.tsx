import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";
import { Button } from "@/src/ui/components/Button";
import { signOut } from "@/src/features/auth";
import { router } from "expo-router";

export default function ProfileScreen() {
  return (
    <View style={s.screen}>
      <Text style={s.title}>PROFILE</Text>
      <Text style={s.sub}>Account and settings will live here.</Text>
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
  title: { fontFamily: FONTS.black, fontSize: 32, color: COLORS.text },
  sub: { fontFamily: FONTS.regular, color: COLORS.muted, marginTop: 8 },
});
