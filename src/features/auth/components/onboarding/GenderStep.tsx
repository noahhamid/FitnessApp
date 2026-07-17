import { useState, useRef } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { FONTS } from "@/src/ui/tokens";
import { useOnboardingStore, type Gender } from "../../store/onboardingStore";

export function GenderStep() {
  const { gender, setGender } = useOnboardingStore();
  const [selected, setSelected] = useState<Gender | null>(gender);

  // Animation for scale and position
  const maleAnim = useRef(new Animated.Value(selected === "male" ? 1 : 0)).current;
  const femaleAnim = useRef(new Animated.Value(selected === "female" ? 1 : 0)).current;

  const handleSelect = (g: Gender) => {
    setSelected(g);
    setGender(g);
    Animated.parallel([
      Animated.timing(maleAnim, { toValue: g === "male" ? 1 : 0, duration: 400, useNativeDriver: true }),
      Animated.timing(femaleAnim, { toValue: g === "female" ? 1 : 0, duration: 400, useNativeDriver: true })
    ]).start();
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>What's your gender?</Text>
      </View>

      <View style={s.viewport}>
        {/* Glow Square */}
        <Animated.View style={[s.shape, s.glow]} />

        <View style={s.stage}>
          {/* Male */}
         <Animated.View style={[s.figureWrapper, {
            transform: [
              { scale: maleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) },
              // When inactive (0), male moves -120px to the left side
              { translateX: maleAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 60] }) }
            ]
          }]}>
            <Pressable onPress={() => handleSelect("male")}>
              <Image source={require("@/assets/images/gendermale.png")} style={s.figure} />
            </Pressable>
          </Animated.View>

          <Animated.View style={[s.figureWrapper, {
            transform: [
              { scale: femaleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) },
              // When inactive (0), female moves +120px to the right side
              { translateX: femaleAnim.interpolate({ inputRange: [0, 1], outputRange: [30, -60] }) }
            ]
          }]}>
            <Pressable onPress={() => handleSelect("female")}>
              <Image source={require("@/assets/images/genderfemale.png")} style={s.figure} />
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {/* Gender Label */}
      <Text style={s.genderLabel}>{selected === "male" ? "MALE" : selected === "female" ? "FEMALE" : ""}</Text>

      {/* Prefer not to say - Marked Button */}
      <Pressable 
        style={[s.markButton, selected === "other" && s.markedActive]} 
        onPress={() => handleSelect("other")}
      >
        <Text style={s.markText}>Prefer not to say</Text>
      </Pressable>

      <View style={s.footer}>
        <Pressable style={s.nextButton} onPress={() => router.push("/(auth)/onboarding/goal")}>
          <Text style={s.nextText}>NEXT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  header: { padding: 24, marginTop: 20 },
  title: { fontSize: 32, fontFamily: FONTS.black, color: "#000000", textAlign: "center" },
  viewport: { flex: 1, justifyContent: "center", alignItems: "center" },
  shape: { width: 250, height: 250, borderRadius: 40, backgroundColor: "#FF1F4D", transform: [{ rotate: "45deg" }] },
  glow: { position: "absolute", shadowColor: "#FF1F4D", shadowOpacity: 0.6, shadowRadius: 30, elevation: 20 },
  
  stage: { flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "center" },
  figureWrapper: { marginHorizontal: 20 },
  figure: { width: 180, height: 360, resizeMode: "contain" },
  
  genderLabel: { color: "#FFF", fontSize: 28, fontFamily: FONTS.bold, textAlign: "center", marginVertical: 20 },
  
  markButton: { backgroundColor: "#1c1d1f", padding: 15, borderWidth: 1, borderColor: "#333", borderRadius: 20, marginHorizontal: 40, alignItems: "center" },
  markedActive: { backgroundColor: "#FF1F4D", borderColor: "#FF1F4D" },
  markText: { color: "#FFF" },
  
  footer: { padding: 24 },
  nextButton: { backgroundColor: "#FF1F4D", padding: 20, borderRadius: 30, alignItems: "center" },
  nextText: { color: "#FFF", fontWeight: "bold" }
});