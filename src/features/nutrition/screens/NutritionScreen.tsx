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

const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF22",
};

const TAB_ICONS: Record<Tab, keyof typeof Ionicons.glyphMap> = {
  Nutrition: "nutrition-outline",
  Weight: "scale-outline",
};

// ─── Animated sliding tab bar ─────────────────────────────────────────────────
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
              color={isActive ? T.bg0 : T.text}
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

// ─── Content with fade transition ────────────────────────────────────────────
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

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function NutritionScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("Nutrition");

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg0} translucent={false} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLabel}>
            <Ionicons name="restaurant-outline" size={10} color={T.muted} />
            <Text style={styles.headerLabelText}>NUTRITION &amp; DIET</Text>
          </View>
          <Text style={styles.headerSub}>Fuel your progress,</Text>
          <Text style={styles.headerHero}>
            {activeTab === "Nutrition" ? "DIET." : "WEIGHT."}
          </Text>
        </View>
      </View>

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

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  headerLeft: { gap: 1 },
  headerLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  headerLabelText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 1.5,
  },
  headerSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.sub,
  },
  headerHero: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 38,
    color: T.text,
    lineHeight: 40,
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: T.border,
  },

  // Tab bar — full-width capsule with bright inactive text for legibility
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: T.bg2,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: T.borderMid,
    position: "relative",
    height: 42,
    alignItems: "center",
  },
  tabPill: {
    position: "absolute",
    top: 3,
    height: 34,
    backgroundColor: T.lime,
    borderRadius: 10,
    shadowColor: T.lime,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  // Inactive tab: crisp white text — high contrast against dark bg2 track
  tabText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.text,
  },
  // Active tab: near-black text on lime pill
  tabTextActive: {
    color: T.bg0,
  },

  // Content area
  content: {
    flex: 1,
  },
});
