import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

type Props = {
  /** Uppercase tracked label (e.g. "OVERVIEW", "ATHLETE PROFILE"). */
  eyebrow: string;
  /** Optional leading mark next to the eyebrow (e.g. Profile shield icon). */
  eyebrowLeading?: ReactNode;
  /** Soft line under the eyebrow (e.g. "Manage your account,"). */
  subtitle?: string;
  /** Large page title — displayBold 28 / -0.5. */
  title: string;
  /** Optional control aligned with the title row (e.g. Edit pill). */
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Shared page chrome for Progress + Profile:
 * eyebrow → optional subtitle → title (+ optional right action).
 */
export function PageHeader({
  eyebrow,
  eyebrowLeading,
  subtitle,
  title,
  action,
  style,
}: Props) {
  const { styles: s } = useThemedStyles(makeStyles);

  return (
    <View style={[s.wrap, style]}>
      <View style={s.eyebrowRow}>
        {eyebrowLeading}
        <Text style={s.eyebrow}>{eyebrow}</Text>
      </View>

      {subtitle ? (
        <Text style={s.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}

      <View style={s.titleRow}>
        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
        {action ? <View style={s.action}>{action}</View> : null}
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingTop: 6,
      paddingBottom: 20,
      gap: 2,
    },
    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginBottom: 4,
    },
    eyebrow: {
      fontFamily: T.bodySemi,
      fontSize: 11,
      color: T.muted,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    subtitle: {
      fontFamily: T.body,
      fontSize: 13,
      color: T.muted,
      marginBottom: 2,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      minWidth: 0,
    },
    title: {
      flex: 1,
      fontFamily: T.displayBold,
      fontSize: 28,
      color: T.white,
      letterSpacing: -0.5,
      lineHeight: 32,
      minWidth: 0,
    },
    action: {
      flexShrink: 0,
      alignSelf: "center",
    },
  });
}
