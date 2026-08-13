import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2, ArrowRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import {
  HOME_FLOATING_BAR_H,
  TAB_PILL_H_MARGIN,
  tabPillTopFromBottom,
} from "@/src/lib/tab-chrome";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  detail?: string;
  complete?: boolean;
  onPress?: () => void;
};

export function HomeFloatingActionBar({
  label,
  detail,
  complete,
  onPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const { T, styles: s } = useThemedStyles(makeStyles);
  const bottom = tabPillTopFromBottom(insets.bottom);

  return (
    <View
      pointerEvents="box-none"
      style={[s.wrap, { bottom, height: HOME_FLOATING_BAR_H }]}
    >
      <View style={s.dock}>
        <View style={s.copy}>
          {detail ? <Text style={s.detail}>{detail}</Text> : null}
          <Text style={s.label} numberOfLines={1}>
            {complete ? "You’re all set for today" : "Next up"}
          </Text>
        </View>
        {complete ? (
          <View style={s.doneBadge}>
            <CheckCircle2 size={16} color={T.accent} strokeWidth={2.3} />
          </View>
        ) : (
          <PressableScale
            onPress={onPress}
            disabled={!onPress}
            scaleTo={0.96}
            style={s.ctaPress}
          >
            <View style={s.cta}>
              <Text style={s.ctaText}>{label}</Text>
              <ArrowRight size={14} color={T.onAccent} strokeWidth={2.4} />
            </View>
          </PressableScale>
        )}
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    wrap: {
      position: "absolute",
      left: Math.max(0, TAB_PILL_H_MARGIN - 4),
      right: Math.max(0, TAB_PILL_H_MARGIN - 4),
      zIndex: 20,
    },
    dock: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 14,
      backgroundColor: T.bgElevated,
      borderTopLeftRadius: T.radius.xl,
      borderTopRightRadius: T.radius.xl,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 10,
    },
    copy: { flex: 1, gap: 2 },
    detail: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.faint,
    },
    label: {
      fontFamily: T.bodySemi,
      fontSize: 13.5,
      color: T.white,
    },
    ctaPress: { borderRadius: T.radius.pill },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: T.accent,
      borderRadius: T.radius.pill,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    ctaText: {
      fontFamily: T.bodyBold,
      fontSize: 12.5,
      color: T.onAccent,
    },
    doneBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: T.accentTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.accentLine,
    },
  });
}
