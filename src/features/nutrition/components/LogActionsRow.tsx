import { ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PenLine, Search, type LucideProps } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { PressableScale } from "./PressableScale";
import { AppIcon } from "@/src/components/AppIcon";
import type { AppIconName } from "@/src/lib/app-icons";

type Action = {
  key: string;
  label: string;
  /** Lucide fallback (e.g. Manual). */
  icon?: ComponentType<LucideProps>;
  /** Glossy PNG (e.g. Scan food). */
  appIcon?: AppIconName;
  primary?: boolean;
  onPress: () => void;
};

export const LOG_ACTION_ICONS = {
  search: Search,
  manual: PenLine,
};

export function LogActionsRow({ actions }: { actions: Action[] }) {
  const { T, styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      {actions.map((a) => {
        const LucideIcon = a.icon;
        const content = (
          <>
            <View
              style={[styles.iconWrap, a.primary && styles.iconWrapPrimary]}
            >
              {a.appIcon ? (
                <AppIcon name={a.appIcon} size={28} />
              ) : LucideIcon ? (
                <LucideIcon
                  size={18}
                  color={a.primary ? T.onAccent : T.accent}
                  strokeWidth={2.2}
                />
              ) : null}
            </View>
            <Text style={[styles.label, a.primary && styles.labelPrimary]}>
              {a.label}
            </Text>
          </>
        );

        return (
          <PressableScale
            key={a.key}
            onPress={a.onPress}
            scaleTo={0.96}
            style={styles.pressableReset}
          >
            {a.primary ? (
              <View style={[styles.btn, styles.btnPrimary]}>{content}</View>
            ) : (
              <GlassSurface style={styles.btnGlass}>{content}</GlassSurface>
            )}
          </PressableScale>
        );
      })}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: 10 },
    pressableReset: { flex: 1, borderRadius: 17 },
    btnGlass: {
      borderRadius: 17,
      paddingVertical: 14,
      alignItems: "center",
    },
    btn: {
      borderRadius: 17,
      paddingVertical: 14,
      alignItems: "center",
    },
    btnPrimary: {
      backgroundColor: T.accent,
      borderWidth: 0.5,
      borderColor: T.accent,
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 14,
      elevation: 3,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: T.ringGlass,
      borderWidth: 0.5,
      borderColor: T.ringBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      zIndex: 1,
    },
    iconWrapPrimary: {
      backgroundColor: "rgba(255,255,255,0.18)",
      borderColor: "rgba(255,255,255,0.28)",
    },
    label: {
      fontFamily: T.bodySemi,
      fontSize: 12,
      color: T.white,
      zIndex: 1,
    },
    labelPrimary: { color: T.onAccent },
  });
}
