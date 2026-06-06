import { View, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { Button } from "@/src/ui/components/Button";
import { useEffect, useState } from "react";

export default function FocusModeRoute() {
  const [now, setNow] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setNow(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={s.screen}>
      <View style={s.content}>
        <View style={s.glowDot} />
        <Text style={s.eyebrow}>STAY FOCUSED</Text>
        <Text style={s.title}>FOCUS MODE</Text>
        <Text style={s.subtitle}>Put your phone down and train.</Text>
        <Text style={s.time}>{now}</Text>
      </View>
      <View style={s.footer}>
        <Button onPress={() => router.replace("/(app)/(tabs)")}>Back to Dashboard</Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0A0A0C",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  glowDot: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#C8F13518",
  },
  eyebrow: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#7A7A8C",
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 52,
    color: "#F2F2F5",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#7A7A8C",
    textAlign: "center",
  },
  time: {
    marginTop: 14,
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 42,
    color: "#F2F2F5",
    letterSpacing: 0.4,
  },
  footer: {
    width: "100%",
  },
});
