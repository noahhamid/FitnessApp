import { View, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { COLORS } from "@/src/theme";
import { TabBar } from "@/src/features/nutrition/components/StatsCard";
import { CaloriesSection } from "@/src/features/nutrition/components/CaloriesSection";
import { WeightSection } from "@/src/features/nutrition/components/WeightSection";

export default function NutritionScreen() {
  const [activeTab, setActiveTab] = useState("Nutrition");
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={() => router.push("/(app)/(tabs)")}
          activeOpacity={0.7}
          style={{
            alignSelf: "flex-start",
            marginBottom: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: COLORS.bg2,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text style={{ color: COLORS.text, fontWeight: "600" }}>← Home</Text>
        </TouchableOpacity>
        <TabBar tabs={["Nutrition", "Weight"]} active={activeTab} onChange={setActiveTab} />
        {activeTab === "Nutrition" ? <CaloriesSection /> : <WeightSection />}
      </View>
    </SafeAreaView>
  );
}
