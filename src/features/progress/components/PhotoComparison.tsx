import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W, 430) - 48;
const PHOTO_H = 180;
const PHOTO_W = (CARD_W - 16 - 10) / 2; // 16px card padding each side, 10px gap

const MOCK_STATS = {
  weeksAgo: 7,
  weightDrop: "3.8 kg",
  fatDrop: "3.8%",
  date: "Jul 14, 2025",
};

function PhotoSlot({
  label,
  tag,
  accent,
}: {
  label: string;
  tag: string;
  accent?: boolean;
}) {
  return (
    <View style={[s.photoSlot, accent && s.photoSlotAccent]}>
      {/* Placeholder silhouette lines */}
      <View style={s.silhouette}>
        <View
          style={[
            s.silhouetteLine,
            { width: 28, height: 28, borderRadius: 14, marginBottom: 8 },
          ]}
        />
        <View
          style={[s.silhouetteLine, { width: 18, height: 52, borderRadius: 6 }]}
        />
        <View
          style={[
            s.silhouetteLine,
            { width: 30, height: 28, borderRadius: 6, marginTop: 4 },
          ]}
        />
      </View>

      {/* Label pill */}
      <View style={[s.tagPill, accent && s.tagPillAccent]}>
        <Text style={[s.tagText, accent && s.tagTextAccent]}>{tag}</Text>
      </View>

      {/* Upload hint */}
      <TouchableOpacity style={s.uploadBtn} activeOpacity={0.7}>
        <Text style={[s.uploadIcon, accent && { color: COLORS.blue }]}>＋</Text>
      </TouchableOpacity>

      <Text style={[s.photoLabel, accent && { color: COLORS.blue }]}>
        {label}
      </Text>
    </View>
  );
}

export function PhotoComparison() {
  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.sectionLabel}>PROGRESS PHOTOS</Text>
          <Text style={s.subtitle}>Visual transformation over time</Text>
        </View>
        <View style={s.weekBadge}>
          <Text style={s.weekText}>WK {MOCK_STATS.weeksAgo}</Text>
        </View>
      </View>

      {/* Photo slots */}
      <View style={s.photosRow}>
        <PhotoSlot label="BEFORE" tag="Week 1" />
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.vsText}>VS</Text>
          <View style={s.dividerLine} />
        </View>
        <PhotoSlot label="AFTER" tag={MOCK_STATS.date} accent />
      </View>

      {/* Footer delta stats */}
      <View style={s.footer}>
        <View style={s.statItem}>
          <Text style={s.statVal}>↓ {MOCK_STATS.weightDrop}</Text>
          <Text style={s.statLabel}>WEIGHT</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statVal, { color: COLORS.blue }]}>
            ↓ {MOCK_STATS.fatDrop}
          </Text>
          <Text style={s.statLabel}>BODY FAT</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{MOCK_STATS.weeksAgo} wks</Text>
          <Text style={s.statLabel}>DURATION</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 2,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    opacity: 0.7,
  },
  weekBadge: {
    backgroundColor: `${COLORS.blue}18`,
    borderWidth: 1,
    borderColor: `${COLORS.blue}35`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  weekText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.blue,
    letterSpacing: 1,
  },

  // Photo row
  photosRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 0,
  },
  photoSlot: {
    width: PHOTO_W,
    height: PHOTO_H,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  photoSlotAccent: {
    borderColor: `${COLORS.blue}50`,
    backgroundColor: `${COLORS.blue}08`,
  },

  // Placeholder silhouette
  silhouette: {
    alignItems: "center",
    opacity: 0.15,
    marginBottom: 8,
  },
  silhouetteLine: {
    backgroundColor: COLORS.muted,
  },

  // Tag pill (top-left corner)
  tagPill: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagPillAccent: {
    backgroundColor: `${COLORS.blue}18`,
    borderColor: `${COLORS.blue}35`,
  },
  tagText: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 0.5,
  },
  tagTextAccent: {
    color: COLORS.blue,
  },

  // Upload button
  uploadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  uploadIcon: {
    fontSize: 18,
    color: COLORS.muted,
    lineHeight: 22,
  },
  photoLabel: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 2,
  },

  // VS divider
  divider: {
    width: 10,
    alignItems: "center",
    height: PHOTO_H,
    justifyContent: "center",
    gap: 4,
  },
  dividerLine: {
    width: 1,
    flex: 1,
    backgroundColor: COLORS.border,
  },
  vsText: {
    fontFamily: FONTS.black,
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 1,
  },

  // Footer stats — mirrors BodyFatChart exactly
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  statVal: {
    fontFamily: FONTS.black,
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1.5,
  },
});
