import { COLORS, FONTS, spacing } from "@/src/theme";
import { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── StatsCard ────────────────────────────────────────────────────────────────

type StatsCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
};

export function StatsCard({
  label,
  value,
  unit,
  color = COLORS.text,
  icon,
  trend,
}: StatsCardProps) {
  const trendColor =
    trend === "up"
      ? COLORS.accent
      : trend === "down"
        ? COLORS.red
        : COLORS.muted;

  // ✅ "neutral" trend shows a dash, not an arrow
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "–";

  return (
    <View style={s.statsCard}>
      {/* Top row — label + icon */}
      <View style={s.statsTop}>
        <Text style={s.statsLabel}>{label}</Text>
        {icon ? (
          <View style={[s.statsIconBadge, { backgroundColor: color + "15" }]}>
            <Text style={s.statsIcon}>{icon}</Text>
          </View>
        ) : null}
      </View>

      {/* Value row */}
      <View style={s.statsValueRow}>
        <Text style={[s.statsValue, { color }]}>{value}</Text>
        {unit ? <Text style={s.statsUnit}>{unit}</Text> : null}
      </View>

      {/* Trend indicator */}
      {trend ? (
        <View
          style={[
            s.statsTrendBadge,
            {
              backgroundColor: trendColor + "15",
              borderColor: trendColor + "30",
            },
          ]}
        >
          <Text style={[s.statsTrendText, { color: trendColor }]}>
            {trendIcon} {trend}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  outline?: boolean;
  color?: string;
  small?: boolean;
  disabled?: boolean;
  icon?: string;
};

export function PrimaryButton({
  label,
  onPress,
  outline = false,
  color = COLORS.accent,
  small = false,
  disabled = false,
  icon,
}: PrimaryButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();

  const bgColor = outline ? "transparent" : disabled ? COLORS.muted2 : color;
  const borderColor = outline
    ? disabled
      ? COLORS.muted2
      : color
    : "transparent";
  const labelColor = outline ? (disabled ? COLORS.muted : color) : COLORS.bg;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        disabled={disabled}
        style={[
          s.btn,
          small ? s.btnSmall : s.btnLarge,
          {
            backgroundColor: bgColor,
            borderColor,
            // ✅ Use opacity style prop, not a conditional value —
            // avoids layout thrash and works correctly with Animated.View
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {icon ? <Text style={s.btnIcon}>{icon}</Text> : null}
        <Text
          style={[s.btnLabel, small && s.btnLabelSmall, { color: labelColor }]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

type SectionHeaderProps = {
  title: string;
  action?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionTitleWrap}>
        <View style={s.sectionAccentBar} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {action ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.7}
          style={s.sectionActionBtn}
          // ✅ Prevent crash when action label is shown but no handler provided
          disabled={!onAction}
        >
          <Text style={s.sectionAction}>{action}</Text>
          <Text style={[s.sectionAction, { fontSize: 11 }]}>›</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── TabBar ───────────────────────────────────────────────────────────────────

type TabBarProps = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
};

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <View style={s.tabBar}>
      {tabs.map((tab) => {
        const isActive = active === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onChange(tab)}
            activeOpacity={0.75}
            style={[s.tabItem, isActive && s.tabItemActive]}
          >
            <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>
              {tab}
            </Text>
            {isActive && <View style={s.tabDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // StatsCard
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: spacing.xs,
  },
  statsTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 0.4,
  },
  statsIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  statsIcon: {
    fontSize: 13,
  },
  statsValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statsValue: {
    fontFamily: FONTS.black,
    fontSize: 26,
    lineHeight: 30,
  },
  statsUnit: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
  },
  statsTrendBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 2,
  },
  statsTrendText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    letterSpacing: 0.3,
  },

  // PrimaryButton
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  btnLarge: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
  },
  btnSmall: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  btnIcon: {
    fontSize: 15,
  },
  btnLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  btnLabelSmall: {
    fontSize: 13,
  },

  // SectionHeader
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionAccentBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
    letterSpacing: 0.8,
  },
  sectionActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: COLORS.accent + "15",
    borderWidth: 1,
    borderColor: COLORS.accent + "25",
  },
  sectionAction: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.accent,
  },

  // TabBar
  tabBar: {
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: COLORS.bg2,
    padding: spacing.xs,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: spacing.lg,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: 10,
    alignItems: "center",
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: COLORS.accent,
  },
  tabLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontFamily: FONTS.bold,
    color: COLORS.bg,
  },
  tabDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.bg + "80",
  },
});
