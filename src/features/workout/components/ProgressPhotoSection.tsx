import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { PHOTO_PLACEHOLDERS } from "@/src/features/workout/services/workout.service";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E",
  bg3: "#252525",
  gold: "#FFC700",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Photo = { id: string; date: string; uri: string | null; label: string };
type SectionTitleProps = {
  title: string;
  action?: string;
  onAction?: () => void;
};
type PhotoThumbProps = { photo: Photo; onAdd: () => void };
type AddSlotBtnProps = { onPress: () => void };

// ── Section header ────────────────────────────────────────────────────────────
function SectionTitle({ title, action, onAction }: SectionTitleProps) {
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
          style={s.actionBtn}
        >
          <Ionicons name="add" size={13} color={T.gold} />
          <Text style={s.actionBtnText}>ADD</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Photo thumbnail ───────────────────────────────────────────────────────────
function PhotoThumb({ photo, onAdd }: PhotoThumbProps) {
  return (
    <TouchableOpacity onPress={onAdd} style={s.photoThumb} activeOpacity={0.82}>
      {photo.uri ? (
        <Image
          source={{ uri: photo.uri }}
          style={s.photoImg}
          resizeMode="cover"
        />
      ) : (
        <View style={s.photoPlaceholder}>
          <Ionicons name="camera-outline" size={22} color={T.muted} />
          <Text style={s.photoPlaceholderText}>TAP TO ADD</Text>
        </View>
      )}

      <View style={s.photoMetaOverlay}>
        <Text style={s.photoLabel}>{photo.label}</Text>
        <Text style={s.photoDate}>{photo.date}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Add new slot button ───────────────────────────────────────────────────────
function AddSlotBtn({ onPress }: AddSlotBtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={s.addSlotBtn}
      activeOpacity={0.75}
    >
      <Ionicons name="add" size={24} color={T.gold} />
      <Text style={s.addSlotText}>NEW{"\n"}ENTRY</Text>
    </TouchableOpacity>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProgressPhotoSection() {
  const [photos, setPhotos] = useState<Photo[]>(PHOTO_PLACEHOLDERS as Photo[]);

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

  return (
    <View style={s.section}>
      <SectionTitle
        title="PROGRESS PHOTOS"
        action="ADD"
        onAction={handleNewEntry}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.photoScroll}
      >
        <AddSlotBtn onPress={handleNewEntry} />
        {photos.map((p) => (
          <PhotoThumb key={p.id} photo={p} onAdd={() => handleAdd(p.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const THUMB_W = 108;
const THUMB_H = 148;

const s = StyleSheet.create({
  section: { paddingTop: 22 },

  // Section header
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 20,
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
    backgroundColor: T.gold, // Gold accent bar
  },
  sectionTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.text,
    letterSpacing: 1.5,
  },

  // ADD button — minimal ghost style
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.bg3,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    // No border — cleaner
  },
  actionBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold,
    letterSpacing: 0.8,
  },

  // Photo scroll row
  photoScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },

  // "NEW ENTRY" slot — dashed gold outline
  addSlotBtn: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: T.gold + "50", // ~30% opacity gold border
    borderStyle: "dashed",
    backgroundColor: T.bg2,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addSlotText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.gold,
    letterSpacing: 1.2,
    textAlign: "center",
    opacity: 0.85,
  },

  // Photo card
  photoThumb: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 16,
    backgroundColor: T.bg2, // #1E1E1E card surface
    overflow: "hidden",
    // No border — card color provides enough contrast
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

  // Overlay label at bottom of each card
  photoMetaOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 9,
    paddingVertical: 7,
    gap: 1,
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
    color: "rgba(255,255,255,0.55)",
  },
});
