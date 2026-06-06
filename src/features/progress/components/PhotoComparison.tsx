import { useWeightLog } from "@/src/features/nutrition/hooks/useWeight";
import { fetchWorkoutSessions } from "@/src/features/workout/services/workout.service";
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W, 430) - 48;
const PHOTO_H = 180;
const PHOTO_W = (CARD_W - 16 - 10) / 2;

const BEFORE_PATH = "progress_before.jpg";
const AFTER_PATH = "progress_after.jpg";

function progressPhotoFile(filename: string) {
  return new FileSystem.File(FileSystem.Paths.document, filename);
}

function PhotoSlot({
  label,
  tag,
  accent,
  imageUri,
  showSaved,
  onPick,
  onDelete,
}: {
  label: string;
  tag: string;
  accent?: boolean;
  imageUri: string | null;
  showSaved: boolean;
  onPick: () => void;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.photoSlot, accent && s.photoSlotAccent]}
      activeOpacity={0.7}
      onPress={onPick}
      onLongPress={() => {
        if (!imageUri) return;
        Alert.alert("Remove photo?", "This will delete the saved progress photo.", [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: onDelete },
        ]);
      }}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={s.photoImg} resizeMode="cover" />
      ) : (
        <View style={s.emptyState}>
          <Ionicons name="camera-outline" size={28} color={COLORS.muted} />
          <Text style={s.tapText}>TAP TO ADD</Text>
        </View>
      )}

      <View style={[s.tagPill, accent && s.tagPillAccent]}>
        <Text style={[s.tagText, accent && s.tagTextAccent]}>{tag}</Text>
      </View>

      {showSaved ? (
        <View style={s.savedBadge}>
          <Text style={s.savedText}>SAVED</Text>
        </View>
      ) : null}

      <Text style={[s.photoLabel, accent && { color: COLORS.blue }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function PhotoComparison() {
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [beforeSaved, setBeforeSaved] = useState(false);
  const [afterSaved, setAfterSaved] = useState(false);
  const { data: weightLogs = [] } = useWeightLog();
  const { data: completedWorkouts = [] } = useQuery({
    queryKey: ["progress", "workouts"],
    queryFn: () => fetchWorkoutSessions("?limit=60&completed=true"),
  });

  useEffect(() => {
    async function loadSavedPhotos() {
      const beforeFile = progressPhotoFile(BEFORE_PATH);
      const afterFile = progressPhotoFile(AFTER_PATH);
      if (beforeFile.exists) setBeforePhoto(beforeFile.uri);
      if (afterFile.exists) setAfterPhoto(afterFile.uri);
    }
    void loadSavedPhotos();
  }, []);

  const sortedWeights = useMemo(
    () => [...weightLogs].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [weightLogs],
  );
  const first = sortedWeights[0];
  const last = sortedWeights[sortedWeights.length - 1];

  const weightDeltaLabel = useMemo(() => {
    if (!first || !last) return "—";
    const diff = Number((last.weight - first.weight).toFixed(1));
    return `${diff >= 0 ? "+" : "−"} ${Math.abs(diff).toFixed(1)} kg`;
  }, [first, last]);

  const durationWeeksLabel = useMemo(() => {
    if (!first || !last) return "—";
    const start = new Date(first.log_date).getTime();
    const end = new Date(last.log_date).getTime();
    const weeks = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24 * 7)));
    return `${weeks} wks`;
  }, [first, last]);

  function flashSaved(slot: "before" | "after") {
    const setSaved = slot === "before" ? setBeforeSaved : setAfterSaved;
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function savePhoto(slot: "before" | "after", sourceUri: string) {
    const filename = slot === "before" ? BEFORE_PATH : AFTER_PATH;
    const dest = progressPhotoFile(filename);
    if (dest.exists) dest.delete();
    new FileSystem.File(sourceUri).copy(dest);
    if (slot === "before") setBeforePhoto(dest.uri);
    else setAfterPhoto(dest.uri);
    flashSaved(slot);
  }

  async function deletePhoto(slot: "before" | "after") {
    const filename = slot === "before" ? BEFORE_PATH : AFTER_PATH;
    const file = progressPhotoFile(filename);
    if (file.exists) file.delete();
    if (slot === "before") setBeforePhoto(null);
    else setAfterPhoto(null);
  }

  async function pickPhoto(slot: "before" | "after") {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      await savePhoto(slot, result.assets[0].uri);
    }
  }

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View>
          <Text style={s.sectionLabel}>PROGRESS PHOTOS</Text>
          <Text style={s.subtitle}>Visual transformation over time</Text>
        </View>
        <View style={s.weekBadge}>
          <Text style={s.weekText}>{durationWeeksLabel}</Text>
        </View>
      </View>

      <View style={s.photosRow}>
        <PhotoSlot
          label="BEFORE"
          tag={first?.log_date ?? "Before"}
          imageUri={beforePhoto}
          showSaved={beforeSaved}
          onPick={() => {
            void pickPhoto("before");
          }}
          onDelete={() => {
            void deletePhoto("before");
          }}
        />
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.vsText}>VS</Text>
          <View style={s.dividerLine} />
        </View>
        <PhotoSlot
          label="AFTER"
          tag={last?.log_date ?? "After"}
          accent
          imageUri={afterPhoto}
          showSaved={afterSaved}
          onPick={() => {
            void pickPhoto("after");
          }}
          onDelete={() => {
            void deletePhoto("after");
          }}
        />
      </View>

      <View style={s.footer}>
        <View style={s.statItem}>
          <Text style={s.statVal}>{weightDeltaLabel}</Text>
          <Text style={s.statLabel}>WEIGHT</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statVal, { color: COLORS.blue }]}>
            {completedWorkouts.length}
          </Text>
          <Text style={s.statLabel}>WORKOUTS</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{durationWeeksLabel}</Text>
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
  photoImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  photoSlotAccent: {
    borderColor: `${COLORS.blue}50`,
    backgroundColor: `${COLORS.blue}08`,
  },

  emptyState: {
    alignItems: "center",
    gap: 8,
  },
  tapText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 2,
  },

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

  savedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: `${COLORS.accent}22`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}50`,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  savedText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.accent,
    letterSpacing: 1.5,
  },

  photoLabel: {
    position: "absolute",
    bottom: 10,
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 2,
  },

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
