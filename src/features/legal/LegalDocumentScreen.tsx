import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { PageHeader } from "@/src/components/PageHeader";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { bottomInset, topInset } from "@/src/lib/safe-area";
import type { AppTheme } from "@/src/theme";
import type { LegalDocument } from "./legal-content";

type Props = {
  document: LegalDocument;
};

/** Split `**bold**` markers into nested Text nodes. */
function RichText({
  text,
  style,
  boldStyle,
}: {
  text: string;
  style: object;
  boldStyle: object;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <Text key={i} style={boldStyle}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}

export function LegalDocumentScreen({ document }: Props) {
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
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          subtitle={`Last updated: ${document.updated}`}
          title={document.title}
        />

        {document.intro.map((para) => (
          <RichText
            key={para}
            text={para}
            style={styles.intro}
            boldStyle={styles.bold}
          />
        ))}

        {document.sections.map((section) => (
          <GlassSurface key={section.heading} style={styles.card}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.blocks.map((block, i) =>
              block.type === "ul" ? (
                <View key={`${section.heading}-ul-${i}`} style={styles.list}>
                  {block.items.map((item) => (
                    <View key={item} style={styles.bulletRow}>
                      <Text style={styles.bulletMark}>·</Text>
                      <RichText
                        text={item}
                        style={styles.body}
                        boldStyle={styles.bold}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <RichText
                  key={`${section.heading}-p-${i}`}
                  text={block.text}
                  style={styles.body}
                  boldStyle={styles.bold}
                />
              ),
            )}
          </GlassSurface>
        ))}
      </ScrollView>
    </View>
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
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: 20,
      gap: 12,
    },
    intro: {
      fontFamily: T.body,
      fontSize: 15,
      lineHeight: 22,
      color: T.text,
      marginBottom: 8,
    },
    card: {
      padding: 18,
      borderRadius: T.radius.lg,
      gap: 10,
    },
    heading: {
      fontFamily: T.displayBold,
      fontSize: 16,
      letterSpacing: -0.2,
      color: T.text,
    },
    body: {
      fontFamily: T.body,
      fontSize: 14,
      lineHeight: 21,
      color: T.muted,
      flex: 1,
    },
    bold: {
      fontFamily: T.bodySemi,
      color: T.text,
    },
    list: {
      gap: 8,
    },
    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    bulletMark: {
      fontFamily: T.bodyBold,
      fontSize: 16,
      lineHeight: 21,
      color: T.accent,
      width: 10,
    },
  });
}
