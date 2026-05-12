import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

import { COLORS, FONTS } from "@/src/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={s.wrap}>
        <Text style={s.title}>This screen does not exist.</Text>
        <Link href="/" style={s.link}>
          <Text style={s.linkText}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: COLORS.bg },
  title: { fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 16, textAlign: "center" },
  link: { marginTop: 8 },
  linkText: { fontFamily: FONTS.semiBold, color: COLORS.accent, fontSize: 16 },
});
