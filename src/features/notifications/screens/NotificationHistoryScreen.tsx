import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Check, ChevronLeft } from "lucide-react-native";

import { useThemedStyles } from "@/src/context/useThemedStyles";
import { useTheme } from "@/src/context/ThemeContext";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { PageHeader } from "@/src/components/PageHeader";
import {
  getNotificationHistory,
  groupHistoryByDate,
  type NotificationHistoryEntry,
  type NotificationHistoryStatus,
} from "@/src/lib/notification-history";
import {
  REMINDER_TYPE_ICON,
  reminderTypeWellColors,
} from "@/src/lib/reminder-type-visuals";

function statusLabel(status: NotificationHistoryStatus): string {
  switch (status) {
    case "scheduled":
      return "Upcoming";
    case "fired":
      return "Delivered";
    case "canceled":
      return "Handled";
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function HistoryRow({ entry }: { entry: NotificationHistoryEntry }) {
  const { T, styles: s } = useThemedStyles(makeRowStyles);
  const { resolved } = useTheme();
  const Icon = REMINDER_TYPE_ICON[entry.type];
  const well = reminderTypeWellColors(entry.type, resolved, T);
  const canceled = entry.status === "canceled";
  const scheduled = entry.status === "scheduled";
  const fired = entry.status === "fired";

  return (
    <GlassSurface style={s.card}>
      <View
        style={[
          s.iconWell,
          {
            backgroundColor: fired
              ? well.bg
              : canceled
                ? T.bgElevated
                : "transparent",
            borderColor: scheduled
              ? well.border
              : canceled
                ? T.border
                : well.border,
            borderWidth: scheduled ? 1.5 : StyleSheet.hairlineWidth,
            opacity: canceled ? 0.55 : 1,
          },
        ]}
      >
        <Icon
          size={18}
          color={canceled ? T.faint : well.icon}
          strokeWidth={fired ? 2.6 : scheduled ? 1.8 : 2.2}
        />
      </View>

      <View style={s.copy}>
        <Text
          style={[
            s.title,
            canceled && s.titleCanceled,
            canceled && { color: T.muted },
          ]}
          numberOfLines={1}
        >
          {entry.title}
        </Text>
        <Text style={s.body} numberOfLines={2}>
          {entry.body}
        </Text>
        <View style={s.metaRow}>
          <Text style={s.meta}>{formatTime(entry.scheduledFor)}</Text>
          <Text style={s.metaDot}>·</Text>
          <Text
            style={[
              s.meta,
              fired && { color: well.icon },
              canceled && { color: T.faint },
            ]}
          >
            {statusLabel(entry.status)}
          </Text>
        </View>
      </View>

      {canceled ? (
        <View style={s.handledMark} accessibilityLabel="Handled">
          <Check size={14} color={T.faint} strokeWidth={2.4} />
        </View>
      ) : null}
    </GlassSurface>
  );
}

function makeRowStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: T.radius.xl,
    },
    iconWell: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    copy: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    title: {
      fontFamily: T.bodySemi,
      fontSize: 15,
      color: T.white,
      letterSpacing: -0.2,
    },
    titleCanceled: {
      textDecorationLine: "line-through",
    },
    body: {
      fontFamily: T.body,
      fontSize: 13,
      color: T.muted,
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 4,
    },
    meta: {
      fontFamily: T.bodySemi,
      fontSize: 11,
      color: T.faint,
      letterSpacing: 0.2,
    },
    metaDot: {
      fontFamily: T.body,
      fontSize: 11,
      color: T.faint,
    },
    handledMark: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
  });
}

export function NotificationHistoryScreen() {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const router = useRouter();
  const [groups, setGroups] = useState(() => groupHistoryByDate([]));
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        const entries = await getNotificationHistory();
        if (!alive) return;
        setGroups(groupHistoryByDate(entries));
        setLoaded(true);
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const empty = loaded && groups.length === 0;

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={20} color={T.white} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          eyebrow="Inbox"
          subtitle="Local reminders on this device"
          title="Notifications"
        />

        {empty ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptyBody}>
              When meal and workout reminders are scheduled, they'll show up
              here — including ones you handled before they fired.
            </Text>
          </View>
        ) : (
          groups.map((g) => (
            <View key={g.key} style={styles.section}>
              <Text style={styles.sectionLabel}>{g.label}</Text>
              <View style={styles.list}>
                {g.entries.map((e) => (
                  <HistoryRow key={e.id} entry={e} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: T.bg,
    },
    topBar: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 0,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 22,
      gap: 10,
    },
    sectionLabel: {
      fontFamily: T.bodySemi,
      fontSize: 12,
      color: T.muted,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    list: {
      gap: 10,
    },
    empty: {
      marginTop: 24,
      paddingVertical: 28,
      paddingHorizontal: 8,
      gap: 8,
    },
    emptyTitle: {
      fontFamily: T.displayBold,
      fontSize: 20,
      color: T.white,
      letterSpacing: -0.3,
    },
    emptyBody: {
      fontFamily: T.body,
      fontSize: 14,
      lineHeight: 20,
      color: T.muted,
    },
  });
}
