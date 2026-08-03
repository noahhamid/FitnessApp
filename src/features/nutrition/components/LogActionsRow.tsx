import { ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, Search, PenLine, LucideProps } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { PressableScale } from "./PressableScale";

type Action = {
  key: string;
  label: string;
  icon: ComponentType<LucideProps>;
  primary?: boolean;
  onPress: () => void;
};

export const LOG_ACTION_ICONS = {
  camera: Camera,
  search: Search,
  manual: PenLine,
};

export function LogActionsRow({ actions }: { actions: Action[] }) {
  const { T, styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      {actions.map((a) => {
        const Icon = a.icon;
        const content = (
          <>
            <View
              style={[styles.iconWrap, a.primary && styles.iconWrapPrimary]}
            >
              <Icon
                size={16}
                color={a.primary ? T.onAccent : T.accent}
                strokeWidth={2.2}
              />
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
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: T.ringGlass,
      borderWidth: 0.5,
      borderColor: T.ringBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      zIndex: 1,
    },
    iconWrapPrimary: {
      backgroundColor: T.accentLine,
      borderColor: T.accentLine,
    },
    label: {
      fontFamily: T.bodySemi,
      fontSize: 11,
      color: T.white,
      zIndex: 1,
    },
    labelPrimary: { color: T.onAccent },
  });
}
