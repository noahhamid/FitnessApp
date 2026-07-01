import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

import { PHOTO_PLACEHOLDERS } from "@/src/features/workout/services/workout.service";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E",
  bg3: "#252525",
  gold: "#FFC700",
  goldDim: "#FFC70018",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Photo = {
  id: string;
  date: string;
  uri: string | null;
  label: string;
  weight?: string; // e.g. "78.4 kg"
};
type SectionTitleProps = {
  title: string;
  action?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
  actionActive?: boolean;
};
type PhotoTileProps = {
  photo: Photo;
  selected: boolean;
  selectionMode: boolean;
  onPress: () => void;
};

// ── Section header ────────────────────────────────────────────────────────────
function SectionTitle({
  title,
  action,
  actionIcon = "add",
  onAction,
  actionActive = false,
}: SectionTitleProps) {
  return (
    <View style={s.sectionTitleRow}>
      <View style={s.titleLeft}>
        <View style={s.titleAccent} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>

      {action && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.7}
          style={[s.actionBtn, actionActive && s.actionBtnActive]}
        >
          <Ionicons
            name={actionIcon}
            size={13}
            color={actionActive ? T.bg0 : T.gold}
          />
          <Text
            style={[s.actionBtnText, actionActive && s.actionBtnTextActive]}
          >
            {action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Hero "add photo" slot ─────────────────────────────────────────────────────
function AddPhotoHero({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.heroSlot} activeOpacity={0.8}>
      <View style={s.heroIconRing}>
        <Ionicons name="add" size={22} color={T.gold} />
      </View>
      <Text style={s.heroTitle}>UPLOAD{"\n"}TRANSFORMATION</Text>
      <Text style={s.heroSubtitle}>Capture today's progress</Text>
    </TouchableOpacity>
  );
}

// ── Photo tile (grid cell) ────────────────────────────────────────────────────
function PhotoTile({
  photo,
  selected,
  selectionMode,
  onPress,
}: PhotoTileProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.photoTile, selected && s.photoTileSelected]}
      activeOpacity={0.85}
    >
      {photo.uri ? (
        <Image
          source={{ uri: photo.uri }}
          style={s.photoImg}
          resizeMode="cover"
        />
      ) : (
        <View style={s.photoPlaceholder}>
          <Ionicons name="camera-outline" size={20} color={T.muted} />
          <Text style={s.photoPlaceholderText}>NO PHOTO</Text>
        </View>
      )}

      {/* Bottom overlay — date + weight pill */}
      <View style={s.photoMetaOverlay}>
        <View>
          <Text style={s.photoLabel}>{photo.label}</Text>
          <Text style={s.photoDate}>{photo.date}</Text>
        </View>
        {photo.weight && (
          <View style={s.weightPill}>
            <Text style={s.weightPillText}>{photo.weight}</Text>
          </View>
        )}
      </View>

      {/* Selection checkmark badge */}
      {selectionMode && (
        <View style={[s.selectBadge, selected && s.selectBadgeActive]}>
          {selected && <Ionicons name="checkmark" size={12} color={T.bg0} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Comparison strip ──────────────────────────────────────────────────────────
function ComparisonStrip({
  photos,
  onClear,
}: {
  photos: Photo[];
  onClear: () => void;
}) {
  // Order chronologically so left = earlier ("before"), right = later ("after")
  const [before, after] = photos;

  return (
    <View style={s.compareWrap}>
      <View style={s.compareRow}>
        <View style={s.compareHalf}>
          {before.uri ? (
            <Image
              source={{ uri: before.uri }}
              style={s.compareImg}
              resizeMode="cover"
            />
          ) : (
            <View style={s.comparePlaceholder}>
              <Ionicons name="camera-outline" size={18} color={T.muted} />
            </View>
          )}
          <View style={s.compareTag}>
            <Text style={s.compareTagText}>BEFORE</Text>
          </View>
          <Text style={s.compareDate}>{before.date}</Text>
        </View>

        <View style={s.compareDivider} />

        <View style={s.compareHalf}>
          {after.uri ? (
            <Image
              source={{ uri: after.uri }}
              style={s.compareImg}
              resizeMode="cover"
            />
          ) : (
            <View style={s.comparePlaceholder}>
              <Ionicons name="camera-outline" size={18} color={T.muted} />
            </View>
          )}
          <View style={[s.compareTag, s.compareTagGold]}>
            <Text style={[s.compareTagText, s.compareTagTextGold]}>AFTER</Text>
          </View>
          <Text style={s.compareDate}>{after.date}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onClear}
        style={s.compareClear}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={13} color={T.sub} />
        <Text style={s.compareClearText}>CLEAR SELECTION</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProgressPhotoSection() {
  const [photos, setPhotos] = useState<Photo[]>(PHOTO_PLACEHOLDERS as Photo[]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedPhotos = useMemo(
    () => photos.filter((p) => selectedIds.includes(p.id)),
    [photos, selectedIds],
  );

  const handleAdd = useCallback((_id: string) => {
    Alert.alert(
      "Add Photo",
      "Install expo-image-picker and call ImagePicker.launchCameraAsync() here.",
      [{ text: "OK" }],
    );
  }, []);

  const handleNewEntry = useCallback(() => {
    const date = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    setPhotos((prev) => [
      { id: `p${Date.now()}`, date, uri: null, label: "Front" },
      ...prev,
    ]);
  }, []);

  const toggleCompareMode = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCompareMode((prev) => !prev);
    setSelectedIds([]);
  }, []);

  const handleTilePress = useCallback(
    (photo: Photo) => {
      if (!compareMode) {
        handleAdd(photo.id);
        return;
      }
      setSelectedIds((prev) => {
        if (prev.includes(photo.id)) {
          return prev.filter((id) => id !== photo.id);
        }
        if (prev.length >= 2) {
          // swap out the oldest selection so it's always max 2
          return [prev[1], photo.id];
        }
        return [...prev, photo.id];
      });
    },
    [compareMode, handleAdd],
  );

  const clearSelection = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedIds([]);
  }, []);

  return (
    <View style={s.section}>
      <SectionTitle
        title="PROGRESS PHOTOS"
        action={compareMode ? "DONE" : "COMPARE"}
        actionIcon={compareMode ? "checkmark" : "swap-horizontal"}
        actionActive={compareMode}
        onAction={toggleCompareMode}
      />

      {selectedPhotos.length === 2 && (
        <ComparisonStrip photos={selectedPhotos} onClear={clearSelection} />
      )}

      <View style={s.grid}>
        {!compareMode && <AddPhotoHero onPress={handleNewEntry} />}
        {photos.map((p) => (
          <PhotoTile
            key={p.id}
            photo={p}
            selected={selectedIds.includes(p.id)}
            selectionMode={compareMode}
            onPress={() => handleTilePress(p)}
          />
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const GRID_GAP = 12;
const TILE_H = 200;

const s = StyleSheet.create({
  section: { paddingTop: 22, paddingHorizontal: 20 },

  // Section header
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleAccent: {
    width: 3,
    height: 20,
    borderRadius: 2,
    backgroundColor: T.gold,
  },
  sectionTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.text,
    letterSpacing: 1.5,
  },

  // Action button (COMPARE / DONE)
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.bg3,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnActive: {
    backgroundColor: T.gold,
  },
  actionBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold,
    letterSpacing: 0.8,
  },
  actionBtnTextActive: {
    color: T.bg0,
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },

  // Hero upload slot
  heroSlot: {
    width: `${(100 - GRID_GAP / 3.6) / 2}%` as any,
    height: TILE_H,
    borderRadius: 16,
    backgroundColor: T.bg2,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  heroIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.goldDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  heroTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 14,
    color: T.gold,
    letterSpacing: 1,
    textAlign: "center",
    lineHeight: 17,
  },
  heroSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    textAlign: "center",
  },

  // Photo tile
  photoTile: {
    width: `${(100 - GRID_GAP / 3.6) / 2}%` as any,
    height: TILE_H,
    borderRadius: 16,
    backgroundColor: T.bg2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  photoTileSelected: {
    borderColor: T.gold,
  },
  photoImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  photoPlaceholderText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.2,
  },

  // Bottom overlay
  photoMetaOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  photoLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.text,
    letterSpacing: 0.3,
  },
  photoDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
  },
  weightPill: {
    backgroundColor: "rgba(255,199,0,0.16)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  weightPillText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.gold,
    letterSpacing: 0.3,
  },

  // Selection badge
  selectBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectBadgeActive: {
    backgroundColor: T.gold,
    borderColor: T.gold,
  },

  // Comparison strip
  compareWrap: {
    backgroundColor: T.bg2,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  compareHalf: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  compareImg: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    backgroundColor: T.bg3,
  },
  comparePlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  compareDivider: {
    width: 1,
    backgroundColor: T.bg3,
    marginHorizontal: 10,
  },
  compareTag: {
    backgroundColor: T.bg3,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  compareTagGold: {
    backgroundColor: T.goldDim,
  },
  compareTagText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.sub,
    letterSpacing: 1,
  },
  compareTagTextGold: {
    color: T.gold,
  },
  compareDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  compareClear: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 6,
  },
  compareClearText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.sub,
    letterSpacing: 0.8,
  },
});
