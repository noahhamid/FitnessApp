import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from "react-native";
import { COLORS, PHOTO_PLACEHOLDERS } from "@/src/theme";

const C = COLORS;

function SectionTitle({ title, action, onAction }) {
  return (
    <View style={s.sectionTitleRow}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={s.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function PhotoThumb({ photo, onAdd }) {
  return (
    <TouchableOpacity onPress={onAdd} style={s.photoThumb} activeOpacity={0.8}>
      {photo.uri ? (
        <Image source={{ uri: photo.uri }} style={s.photoImg} />
      ) : (
        <View style={s.photoPlaceholder}>
          <Text style={{ fontSize: 22 }}>📸</Text>
          <Text style={s.photoPlaceholderText}>ADD</Text>
        </View>
      )}
      <View style={s.photoMeta}>
        <Text style={s.photoDate}>{photo.date}</Text>
        <Text style={s.photoLabel}>{photo.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ProgressPhotoSection() {
  const [photos, setPhotos] = useState(PHOTO_PLACEHOLDERS);

  const handleAdd = (id) => {
    Alert.alert(
      "Progress Photo",
      "Install expo-image-picker and call ImagePicker.launchCameraAsync() here."
    );
  };

  const handleNewPhoto = () => {
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setPhotos((prev) => [
      { id: `p${Date.now()}`, date, uri: null, label: "Front" },
      ...prev,
    ]);
  };

  return (
    <View style={s.section}>
      <SectionTitle title="PROGRESS PHOTOS" action="+ ADD" onAction={handleNewPhoto} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {photos.map((p) => (
          <PhotoThumb key={p.id} photo={p} onAdd={() => handleAdd(p.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 20,
    color: C.text,
    letterSpacing: 0.5,
  },
  sectionAction: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: C.accent,
  },
  photoThumb: {
    width: 100,
    height: 130,
    borderRadius: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  photoImg: {
    width: "100%",
    height: "70%",
  },
  photoPlaceholder: {
    height: "70%",
    backgroundColor: C.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
  },
  photoMeta: {
    height: "30%",
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: C.bg3,
    justifyContent: "center",
  },
  photoDate: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: C.text,
  },
  photoLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: C.muted,
    marginTop: 1,
  },
});