import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell } from "lucide-react-native";
import { router } from "expo-router";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { getGreeting } from "@/src/lib/greeting";

type Props = {
  name: string;
  /**
   * Visual unread dot matching the reference chrome.
   * Decorative until unread tracking ships.
   */
  showUnreadDot?: boolean;
  /** When false, omit greeting text. Default true. */
  showGreeting?: boolean;
  /** When false, omit initials avatar (Dashboard uses wave emoji instead). Default true. */
  showAvatar?: boolean;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  return parts
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function onBellPress() {
  router.push("/(app)/notifications");
}

/**
 * Compact greeting header (Dashboard):
 * optional initials avatar · "Good morning, {name} 👋" · bell (+ unread dot).
 */
export function SimpleGreetingHeader({
  name,
  showUnreadDot = true,
  showGreeting = true,
  showAvatar = true,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const displayName = name.trim() || "there";
  const greeting = getGreeting();
  const leftNeedsGrow = showGreeting;

  return (
    <View style={s.row}>
      <View style={[s.left, leftNeedsGrow && s.leftGrow]}>
        {showAvatar ? (
          <View style={s.avatar} accessibilityLabel="Profile avatar">
            <Text style={s.initials}>{initialsFromName(displayName)}</Text>
          </View>
        ) : null}
        {showGreeting ? (
          <Text style={s.greeting} numberOfLines={1}>
            {greeting}, {displayName} 👋
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={onBellPress}
        hitSlop={10}
        style={s.bellBtn}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Bell size={20} color={T.white} strokeWidth={2} />
        {showUnreadDot && <View style={s.unreadDot} pointerEvents="none" />}
      </Pressable>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 8,
      gap: 12,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minWidth: 0,
      flexShrink: 0,
    },
    leftGrow: {
      flex: 1,
      flexShrink: 1,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: T.accentTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.accentLine,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    initials: {
      fontFamily: T.displayBold,
      fontSize: 12,
      color: T.accent,
      letterSpacing: 0.2,
    },
    greeting: {
      flex: 1,
      fontFamily: T.displayBold,
      fontSize: 18,
      letterSpacing: -0.3,
      color: T.white,
    },
    bellBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    unreadDot: {
      position: "absolute",
      top: 8,
      right: 9,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: T.badge,
      borderWidth: 1.5,
      borderColor: T.bg,
    },
  });
}
