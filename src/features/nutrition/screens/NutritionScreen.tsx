import { CaloriesSection } from "@/src/features/nutrition/components/CaloriesSection";
import { WeightSection } from "@/src/features/nutrition/components/WeightSection";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = ["Nutrition", "Weight"] as const;
type Tab = (typeof TABS)[number];

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E",
  bg3: "#252525",
  gold: "#FFC700",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

const TAB_ICONS: Record<Tab, keyof typeof Ionicons.glyphMap> = {
  Nutrition: "nutrition-outline",
  Weight: "scale-outline",
};

// ── Animated sliding tab bar ──────────────────────────────────────────────────
function SlideTabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: TABS.indexOf(active),
      useNativeDriver: true,
      tension: 72,
      friction: 12,
    }).start();
  }, [active]);

  const pillW = barWidth > 0 ? barWidth / TABS.length - 6 : 0;

  return (
    <View
      style={styles.tabBar}
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
    >
      {barWidth > 0 && (
        <Animated.View
          style={[
            styles.tabPill,
            {
              width: pillW,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [3, pillW + 9],
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={styles.tabItem}
          >
            <Ionicons
              name={TAB_ICONS[tab]}
              size={13}
              color={isActive ? T.bg0 : T.sub}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Fade content transition ───────────────────────────────────────────────────
function FadeContent({ activeTab }: { activeTab: Tab }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [displayedTab, setDisplayedTab] = useState<Tab>(activeTab);

  useEffect(() => {
    if (activeTab === displayedTab) return;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setDisplayedTab(activeTab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab]);

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      {displayedTab === "Nutrition" ? <CaloriesSection /> : <WeightSection />}
    </Animated.View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function NutritionScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("Nutrition");

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={T.bg0}
        translucent={false}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Eyebrow label */}
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>NUTRITION &amp; DIET</Text>
          </View>

          {/* Sub + hero */}
          <Text style={styles.headerSub}>Fuel your progress,</Text>
          <Text style={styles.headerHero}>
            {activeTab === "Nutrition" ? "DIET." : "WEIGHT."}
          </Text>
        </View>
      </View>

      {/* Thin gold-tinted divider */}
      <View style={styles.divider} />

      {/* ── Tab bar ── */}
      <View style={styles.tabBarWrapper}>
        <SlideTabBar active={activeTab} onChange={setActiveTab} />
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        <FadeContent activeTab={activeTab} />
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg0,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: { gap: 2 },

  // Eyebrow — gold dot + label replaces the icon+text row
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.gold,
  },
  eyebrowText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 2,
  },

  headerSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.sub,
  },
  headerHero: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 42,
    color: T.text,
    lineHeight: 44,
    letterSpacing: 0.5,
  },

  // Divider — barely visible, no lime tint
  divider: {
    height: 1,
    backgroundColor: T.bg3,
  },

  // Tab bar
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: T.bg2,
    borderRadius: 12,
    padding: 3,
    position: "relative",
    height: 44,
    alignItems: "center",
    // No border — bg2 on bg0 is enough contrast
  },

  // Active pill — solid gold, no glow shadow
  tabPill: {
    position: "absolute",
    top: 3,
    height: 36,
    backgroundColor: T.gold,
    borderRadius: 10,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.sub, // Muted gray for inactive
  },
  tabTextActive: {
    color: T.bg0, // Dark on gold pill
    fontFamily: "DMSans_400Regular",
  },

  // Content
  content: { flex: 1 },
});
