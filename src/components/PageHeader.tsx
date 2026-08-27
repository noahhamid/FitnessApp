import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

type Props = {
  /** @deprecated Unused — kept so call sites compile. */
  eyebrow?: string;
  /** @deprecated Unused — kept so call sites compile. */
  eyebrowLeading?: ReactNode;
  /** Soft line under the heading (e.g. "Manage your account,"). */
  subtitle?: string;
  /** Large page title — displayBold 28 / -0.5. */
  title: string;
  /** Optional control aligned with the title row (e.g. Edit pill). */
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Shared page chrome: title (+ optional action). No brand wordmark on tabs.
 */
export function PageHeader({
  subtitle,
  title,
  action,
  style,
}: Props) {
  const { styles: s } = useThemedStyles(makeStyles);

  return (
    <View style={[s.wrap, style]}>
      <View style={s.titleRow}>
        <View style={s.heading}>
          <Text style={s.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {action ? <View style={s.action}>{action}</View> : null}
      </View>

      {subtitle ? (
        <Text style={s.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingTop: 6,
      paddingBottom: 20,
      gap: 4,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      minWidth: 0,
    },
    heading: {
      flex: 1,
      minWidth: 0,
    },
    subtitle: {
      fontFamily: T.body,
      fontSize: 13,
      color: T.muted,
    },
    title: {
      fontFamily: T.displayBold,
      fontSize: 28,
      color: T.white,
      letterSpacing: -0.5,
      lineHeight: 32,
      flexShrink: 1,
      minWidth: 0,
    },
    action: {
      flexShrink: 0,
      alignSelf: "center",
    },
  });
}
