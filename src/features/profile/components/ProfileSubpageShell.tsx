import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { PageHeader } from "@/src/components/PageHeader";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import { bottomInset, topInset } from "@/src/lib/safe-area";
import type { AppTheme } from "@/src/theme";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSave: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
};

/** Stack page chrome matching Privacy / Terms: back chevron + scroll body. */
export function ProfileSubpageShell({
  title,
  subtitle,
  children,
  onSave,
  saving,
  saveDisabled,
}: Props) {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: topInset(insets.top) }]}>
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={T.bg}
      />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={20} color={T.text} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomInset(insets.bottom) + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          subtitle={subtitle}
          title={title}
          action={
            <Pressable
              style={[
                styles.saveBtn,
                (saving || saveDisabled) && styles.saveBtnDisabled,
              ]}
              onPress={onSave}
              disabled={saving || saveDisabled}
              accessibilityRole="button"
              accessibilityLabel="Save"
            >
              {saving ? (
                <ActivityIndicator size="small" color={T.onAccent} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </Pressable>
          }
        />
        {children}
      </ScrollView>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    topBar: {
      paddingHorizontal: T.space.xl,
      paddingBottom: 4,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: T.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
    },
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: T.space.xl,
      maxWidth: 430,
      width: "100%",
      alignSelf: "center",
    },
    saveBtn: {
      backgroundColor: T.accent,
      borderRadius: T.radius.pill,
      paddingHorizontal: 16,
      paddingVertical: 8,
      minWidth: 64,
      alignItems: "center",
    },
    saveBtnDisabled: { opacity: 0.55 },
    saveBtnText: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.onAccent,
    },
  });
}
