import { CaloriesSection } from "@/src/features/nutrition/components/CaloriesSection";
import { WeightSection } from "@/src/features/nutrition/components/WeightSection";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  borderMid: "#FFFFFF18",
};

const TAB_META: Record<Tab, { emoji: string }> = {
  Nutrition: { emoji: "🥗" },
  Weight: { emoji: "⚖️" },
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
    const idx = TABS.indexOf(active);
    Animated.spring(slideAnim, {
      toValue: idx,
      useNativeDriver: true,
      tension: 68,
      friction: 11,
    }).start();
  }, [active]);

  const pillW = barWidth / TABS.length - 6;

  return (
    <View
      style={styles.tabBar}
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
    >
      {/* Sliding pill */}
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
        const { emoji } = TAB_META[tab];
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={styles.tabItem}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {emoji} {tab}
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
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setDisplayedTab(activeTab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
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
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* FIX: configure status bar explicitly */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={T.bg0}
        translucent={false}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NUTRITION</Text>
        <View style={styles.headerUnderline} />
      </View>

      {/* Thin divider */}
      <View style={styles.divider} />

      {/* ── Tab bar ── */}
      <View style={styles.tabBarWrapper}>
        <SlideTabBar active={activeTab} onChange={setActiveTab} />
      </View>

      {/* ── Content ── */}
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        <FadeContent activeTab={activeTab} />
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 32,
    color: T.text,
    letterSpacing: 0.3,
  },
  headerUnderline: {
    marginTop: 4,
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: T.lime,
  },

  divider: {
    height: 1,
    backgroundColor: T.border,
    marginHorizontal: 0,
  },

  // Tab bar
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: T.bg2,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: T.border,
    position: "relative",
    height: 44,
    alignItems: "center",
  },
  tabPill: {
    position: "absolute",
    top: 3,
    height: 36,
    backgroundColor: T.lime,
    borderRadius: 11,
    // Subtle glow
    shadowColor: T.lime,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: T.muted,
  },
  tabTextActive: {
    color: T.bg0,
    fontWeight: "700",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
