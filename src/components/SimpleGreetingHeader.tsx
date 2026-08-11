import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollText } from "lucide-react-native";
import { router } from "expo-router";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { getGreeting } from "@/src/lib/greeting";

type Props = {
  name: string;
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

function onLogsPress() {
  router.push("/(app)/logs");
}

/**
 * Compact greeting header (Dashboard):
 * optional initials avatar · "Good morning, {name} 👋" · reminder logs.
 */
export function SimpleGreetingHeader({
  name,
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
        onPress={onLogsPress}
        hitSlop={10}
        style={s.logsBtn}
        accessibilityRole="button"
        accessibilityLabel="Reminder logs"
      >
        <ScrollText size={20} color={T.white} strokeWidth={2} />
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
    logsBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
  });
}
