import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Fixed: import directly from tokens, NOT from @/src/theme
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";

// ── Types ─────────────────────────────────────────────────────────────────────

type App = {
  id: string;
  name: string;
  category: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  blocked: boolean;
};

// ── Default blocked apps list ─────────────────────────────────────────────────

const DEFAULT_APPS: App[] = [
  {
    id: "instagram",
    name: "Instagram",
    category: "Social",
    iconName: "logo-instagram",
    iconColor: "#E1306C",
    blocked: true,
  },
  {
    id: "twitter",
    name: "Twitter / X",
    category: "Social",
    iconName: "logo-twitter",
    iconColor: "#1DA1F2",
    blocked: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Video",
    iconName: "logo-youtube",
    iconColor: "#FF0000",
    blocked: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Social",
    iconName: "musical-notes-outline",
    iconColor: "#69C9D0",
    blocked: false,
  },
  {
    id: "reddit",
    name: "Reddit",
    category: "Social",
    iconName: "logo-reddit",
    iconColor: "#FF4500",
    blocked: false,
  },
];

// ── App Row ───────────────────────────────────────────────────────────────────

type AppRowProps = {
  app: App;
  onToggle: (id: string) => void;
};

function AppRow({ app, onToggle }: AppRowProps) {
  return (
    <View style={s.appRow}>
      {/* Icon */}
      <View style={[s.appIcon, { backgroundColor: `${app.iconColor}18` }]}>
        <Ionicons name={app.iconName} size={18} color={app.iconColor} />
      </View>

      {/* Name + category */}
      <View style={s.appInfo}>
        <Text style={s.appName}>{app.name}</Text>
        <Text style={s.appCategory}>{app.category}</Text>
      </View>

      {/* Blocked badge */}
      {app.blocked && (
        <View style={s.blockedBadge}>
          <Ionicons name="ban-outline" size={10} color={COLORS.red} />
          <Text style={s.blockedText}>BLOCKED</Text>
        </View>
      )}

      {/* Toggle */}
      <Switch
        value={app.blocked}
        onValueChange={() => onToggle(app.id)}
        trackColor={{ false: COLORS.bg3, true: `${COLORS.accent}60` }}
        thumbColor={app.blocked ? COLORS.accent : COLORS.muted}
        ios_backgroundColor={COLORS.bg3}
        style={{ transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }] }}
      />
    </View>
  );
}

// ── Stats row ─────────────────────────────────────────────────────────────────

function StatsRow({ blocked, total }: { blocked: number; total: number }) {
  return (
    <View style={s.statsRow}>
      <View style={s.statItem}>
        <Text style={s.statVal}>{blocked}</Text>
        <Text style={s.statLabel}>BLOCKED</Text>
      </View>
      <View style={s.statDivider} />
      <View style={s.statItem}>
        <Text style={s.statVal}>{total - blocked}</Text>
        <Text style={s.statLabel}>ALLOWED</Text>
      </View>
      <View style={s.statDivider} />
      <View style={s.statItem}>
        <Text style={[s.statVal, { color: COLORS.accent }]}>{total}</Text>
        <Text style={s.statLabel}>TOTAL</Text>
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BlockedAppsPanel() {
  const [apps, setApps] = useState<App[]>(DEFAULT_APPS);
  const [expanded, setExpanded] = useState(true);

  const toggle = (id: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, blocked: !a.blocked } : a)),
    );
  };

  const handleAddApp = () => {
    Alert.alert(
      "Add App",
      "In production, use expo-intent-launcher or platform APIs to fetch installed apps.",
      [{ text: "OK" }],
    );
  };

  const blockedCount = apps.filter((a) => a.blocked).length;

  return (
    <View style={s.card}>
      {/* Header */}
      <TouchableOpacity
        style={s.header}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <View style={s.headerLeft}>
          <View style={s.headerIconWrap}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.accent} />
          </View>
          <View>
            <Text style={s.title}>BLOCKED APPS</Text>
            <Text style={s.subtitle}>
              {blockedCount} app{blockedCount !== 1 ? "s" : ""} blocked during
              focus
            </Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={COLORS.muted}
        />
      </TouchableOpacity>

      {expanded && (
        <>
          {/* Stats */}
          <StatsRow blocked={blockedCount} total={apps.length} />

          {/* Divider */}
          <View style={s.divider} />

          {/* App list */}
          <View style={s.appList}>
            {apps.map((app) => (
              <AppRow key={app.id} app={app} onToggle={toggle} />
            ))}
          </View>

          {/* Add app button */}
          <TouchableOpacity
            style={s.addBtn}
            onPress={handleAddApp}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={16} color={COLORS.accent} />
            <Text style={s.addBtnText}>ADD APP</Text>
          </TouchableOpacity>

          {/* Info note */}
          <View style={s.infoRow}>
            <Ionicons
              name="information-circle-outline"
              size={12}
              color={COLORS.muted}
            />
            <Text style={s.infoText}>
              Apps are blocked system-wide during an active Focus session.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 14,
    color: COLORS.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  statVal: {
    fontFamily: FONTS.black,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  appList: { gap: 4 },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  appIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  appInfo: { flex: 1, gap: 2 },
  appName: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.text,
  },
  appCategory: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
  },
  blockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: `${COLORS.red}15`,
    borderWidth: 1,
    borderColor: `${COLORS.red}30`,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  blockedText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.red,
    letterSpacing: 0.8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: `${COLORS.accent}40`,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: `${COLORS.accent}08`,
  },
  addBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.accent,
    letterSpacing: 1.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    flex: 1,
    lineHeight: 16,
  },
});
