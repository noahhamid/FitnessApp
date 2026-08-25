import { StyleSheet, Text, View } from "react-native";
import { Bell } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "./GlassSurface";
import { PressableScale } from "./PressableScale";
import type { ReminderContent } from "@/src/lib/reminder-content";

type Props = {
  content: ReminderContent;
  onPress: () => void;
};

export function ReminderNudgeCard({ content, onPress }: Props) {
  const { T, styles } = useThemedStyles(makeStyles);

  return (
    <GlassSurface style={styles.card}>
      <View style={styles.icon}>
        <Bell size={16} color={T.accent} strokeWidth={2.2} />
      </View>
      <View style={styles.body}>
        <Text style={styles.message}>{content.message}</Text>
        <PressableScale onPress={onPress} scaleTo={0.97} style={styles.ctaPress}>
          <Text style={styles.cta}>{content.actionLabel}</Text>
        </PressableScale>
      </View>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: T.radius.lg,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    icon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
    },
    body: { flex: 1, gap: 4 },
    message: {
      fontFamily: T.bodyMed,
      fontSize: 13,
      color: T.white,
      lineHeight: 18,
    },
    ctaPress: { alignSelf: "flex-start" },
    cta: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.accent,
    },
  });
}
