import { CaloriesSection } from "@/src/features/nutrition/components/CaloriesSection";
import { WeightSection } from "@/src/features/nutrition/components/WeightSection";
import { COLORS } from "@/src/theme";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = ["Nutrition", "Weight"] as const;
type Tab = (typeof TABS)[number];

const TAB_META: Record<Tab, { emoji: string; subtitle: string }> = {
  Nutrition: { emoji: "🥗", subtitle: "Calories & macros" },
  Weight: { emoji: "⚖️", subtitle: "Track your progress" },
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
  const { emoji, subtitle } = TAB_META[activeTab];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* FIX: configure status bar explicitly */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.bg}
        translucent={false}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        {/* Back button — FIX: use router.back() not router.push() */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        {/* Title block */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {emoji} {activeTab}
          </Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>

        {/* Spacer to balance the back button */}
        <View style={styles.headerSpacer} />
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
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 8 : 4,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
    lineHeight: 28,
    fontWeight: "300",
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 1,
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 36,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 0,
  },

  // Tab bar
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.bg2,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    height: 44,
    alignItems: "center",
  },
  tabPill: {
    position: "absolute",
    top: 3,
    height: 36,
    backgroundColor: COLORS.accent,
    borderRadius: 11,
    // Subtle glow
    shadowColor: COLORS.accent,
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
    color: COLORS.muted,
  },
  tabTextActive: {
    color: COLORS.bg,
    fontWeight: "700",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
