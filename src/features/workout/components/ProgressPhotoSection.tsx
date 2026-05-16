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

// Fixed: import directly from tokens, NOT from @/src/theme
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
// Fixed: PHOTO_PLACEHOLDERS belongs in workout service, not theme
import { PHOTO_PLACEHOLDERS } from "@/src/features/workout/services/workout.service";

// ── Types ─────────────────────────────────────────────────────────────────────

type Photo = {
  id: string;
  date: string;
  uri: string | null;
  label: string;
};

type SectionTitleProps = {
  title: string;
  action?: string;
  onAction?: () => void;
};

type PhotoThumbProps = {
  photo: Photo;
  onAdd: () => void;
};

type AddSlotBtnProps = {
  onPress: () => void;
};

// ── Section header ────────────────────────────────────────────────────────────

function SectionTitle({ title, action, onAction }: SectionTitleProps) {
  return (
    <View style={s.sectionTitleRow}>
      <View style={s.titleLeft}>
        <View style={s.titleAccent} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {action ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.7}
          style={s.actionBtn}
        >
          {/* Fixed: was "+ ADD" string — now Ionicons + text */}
          <Ionicons name="add" size={12} color={COLORS.accent} />
          <Text style={s.actionBtnText}>ADD</Text>
        </TouchableOpacity>
      ) : null}
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
          {/* Fixed: was 📸 emoji — now Ionicons */}
          <Ionicons name="camera-outline" size={24} color={COLORS.muted} />
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
      {/* Fixed: was ＋ emoji text — now Ionicons */}
      <Ionicons name="add-circle-outline" size={28} color={COLORS.accent} />
      <Text style={s.addSlotText}>NEW{"\n"}ENTRY</Text>
    </TouchableOpacity>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

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
    backgroundColor: COLORS.accent,
  },
  sectionTitle: {
    // Fixed: hardcoded font string → FONTS token
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: 1,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}35`,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  actionBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.accent,
    letterSpacing: 0.3,
  },

  photoScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },

  addSlotBtn: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: `${COLORS.accent}40`,
    borderStyle: "dashed",
    backgroundColor: `${COLORS.accent}08`,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addSlotText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.accent,
    letterSpacing: 1.2,
    textAlign: "center",
    opacity: 0.8,
  },

  photoThumb: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  photoImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  photoPlaceholderText: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  photoMetaOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.52)",
    paddingHorizontal: 9,
    paddingVertical: 7,
    gap: 1,
  },
  photoLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: "#fff",
    letterSpacing: 0.2,
  },
  photoDate: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
  },
});
