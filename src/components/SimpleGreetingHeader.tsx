import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollText } from "lucide-react-native";
import { router } from "expo-router";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { getGreeting } from "@/src/lib/greeting";
import { fullDayLabel } from "@/src/lib/week-days";
import { localDateOnly } from "@/src/features/progress/lib/localDate";
type Props = {
  name: string;
  /** When false, omit greeting text. Default true. */
  showGreeting?: boolean;
  /** Unused — home no longer shows an avatar. Kept for call-site compat. */
  showAvatar?: boolean;
  /** When false, omit today's weekday + date under the greeting. Default true. */
  showDate?: boolean;
};

function onLogsPress() {
  router.push("/(app)/logs");
}

/**
 * Home header: greeting + date (no brand wordmark on tabs).
 */
export function SimpleGreetingHeader({
  name,
  showGreeting = true,
  showDate = true,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const displayName = name.trim() || "there";
  const greeting = getGreeting();
  const leftNeedsGrow = showGreeting || showDate;

  return (
    <View style={s.row}>
      <View style={[s.left, leftNeedsGrow && s.leftGrow]}>
        {showGreeting || showDate ? (
          <View style={s.greetingStack}>
            {showGreeting ? (
              <Text style={s.greeting} numberOfLines={1}>
                {greeting}, {displayName}
              </Text>
            ) : null}
            {showDate ? (
              <Text style={s.date} numberOfLines={1}>
                {fullDayLabel(localDateOnly())}
              </Text>
            ) : null}
          </View>
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
      minWidth: 0,
      flexShrink: 0,
      gap: 4,
    },
    leftGrow: {
      flex: 1,
      flexShrink: 1,
    },
    greetingStack: {
      minWidth: 0,
      gap: 1,
    },
    greeting: {
      fontFamily: T.displayBold,
      fontSize: 22,
      letterSpacing: -0.4,
      color: T.white,
    },
    date: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      letterSpacing: -0.1,
      color: T.muted,
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
