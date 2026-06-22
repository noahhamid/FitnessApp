import { useWeightLog } from "@/src/features/nutrition/hooks/useWeight";
import { fetchWorkoutSessions } from "@/src/features/workout/services/workout.service";
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

const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  blue: "#3D8EFF",
  red: "#FF3D3D",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W, 430) - 48;
const PHOTO_H = 190;
const PHOTO_W = (CARD_W - 10 - 10) / 2; // gap of 10 between slots

const BEFORE_PATH = "progress_before.jpg";
const AFTER_PATH = "progress_after.jpg";

function progressPhotoFile(filename: string) {
  return new FileSystem.File(FileSystem.Paths.document, filename);
}

// ── Photo slot ────────────────────────────────────────────────────────────────
function PhotoSlot({
  label,
  tag,
  isAfter,
  imageUri,
  showSaved,
  onPick,
  onDelete,
}: {
  label: string;
  tag: string;
  isAfter?: boolean;
  imageUri: string | null;
  showSaved: boolean;
  onPick: () => void;
  onDelete: () => void;
}) {
  const accentColor = isAfter ? T.lime : T.blue;

  return (
    <TouchableOpacity
      style={[
        s.photoSlot,
        {
          borderColor: accentColor + "30",
          backgroundColor: accentColor + "08",
        },
      ]}
      activeOpacity={0.75}
      onPress={onPick}
      onLongPress={() => {
        if (!imageUri) return;
        Alert.alert(
          "Remove photo?",
          "This will delete the saved progress photo.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: onDelete },
          ],
        );
      }}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={s.photoImg}
          resizeMode="cover"
        />
      ) : (
        <View style={s.emptySlot}>
          <View
            style={[
              s.cameraIconWrap,
              {
                backgroundColor: accentColor + "18",
                borderColor: accentColor + "30",
              },
            ]}
          >
            <Ionicons name="camera-outline" size={22} color={accentColor} />
          </View>
          <Text style={[s.tapText, { color: accentColor }]}>TAP TO ADD</Text>
          <Text style={s.tapHint}>{label} photo</Text>
        </View>
      )}

      {/* Tag pill — top left */}
      <View
        style={[
          s.tagPill,
          {
            backgroundColor: accentColor + "22",
            borderColor: accentColor + "40",
          },
        ]}
      >
        <Text style={[s.tagText, { color: accentColor }]}>{tag}</Text>
      </View>

      {/* Saved badge — top right */}
      {showSaved && (
        <View style={s.savedBadge}>
          <Ionicons name="checkmark" size={9} color={T.lime} />
          <Text style={s.savedText}>SAVED</Text>
        </View>
      )}

      {/* Label — bottom center */}
      <View style={[s.labelPill, { backgroundColor: accentColor + "22" }]}>
        <Text style={[s.labelText, { color: accentColor }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
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

  const weightDelta = useMemo(() => {
    if (!first || !last) return null;
    return Number((last.weight - first.weight).toFixed(1));
  }, [first, last]);

  const weightDeltaLabel = useMemo(() => {
    if (weightDelta === null) return "—";
    return `${weightDelta >= 0 ? "+" : "−"} ${Math.abs(weightDelta).toFixed(1)} kg`;
  }, [weightDelta]);

  const durationWeeksLabel = useMemo(() => {
    if (!first || !last) return "—";
    const start = new Date(first.log_date).getTime();
    const end = new Date(last.log_date).getTime();
    const weeks = Math.max(
      0,
      Math.round((end - start) / (1000 * 60 * 60 * 24 * 7)),
    );
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

  const deltaPositive = weightDelta !== null && weightDelta < 0; // losing = good
  const deltaColor =
    weightDelta === null ? T.muted : deltaPositive ? T.lime : T.red;

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.cardLabel}>PROGRESS PHOTOS</Text>
          <Text style={s.subtitle}>Tap to add · Long press to remove</Text>
        </View>
        <View style={s.durationPill}>
          <Ionicons name="calendar-outline" size={11} color={T.blue} />
          <Text style={s.durationText}>{durationWeeksLabel}</Text>
        </View>
      </View>

      {/* Photos row */}
      <View style={s.photosRow}>
        <PhotoSlot
          label="BEFORE"
          tag={first?.log_date ?? "Start"}
          imageUri={beforePhoto}
          showSaved={beforeSaved}
          onPick={() => void pickPhoto("before")}
          onDelete={() => void deletePhoto("before")}
        />

        {/* VS divider */}
        <View style={s.vsDivider}>
          <View style={s.vsLine} />
          <View style={s.vsCircle}>
            <Text style={s.vsText}>VS</Text>
          </View>
          <View style={s.vsLine} />
        </View>

        <PhotoSlot
          label="AFTER"
          tag={last?.log_date ?? "Now"}
          isAfter
          imageUri={afterPhoto}
          showSaved={afterSaved}
          onPick={() => void pickPhoto("after")}
          onDelete={() => void deletePhoto("after")}
        />
      </View>

      {/* Footer stats */}
      <View style={s.footer}>
        <View style={s.statItem}>
          <Text style={[s.statVal, { color: deltaColor }]}>
            {weightDeltaLabel}
          </Text>
          <Text style={s.statLabel}>WEIGHT</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statVal, { color: T.lime }]}>
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
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    padding: 16,
    marginBottom: 8,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerLeft: { gap: 3 },
  cardLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 1.4,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    opacity: 0.7,
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.blue + "18",
    borderWidth: 1,
    borderColor: T.blue + "35",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.blue,
    letterSpacing: 0.5,
  },

  // ── Photos row ────────────────────────────────────────────────────────────
  photosRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  photoSlot: {
    width: PHOTO_W,
    height: PHOTO_H,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  emptySlot: {
    alignItems: "center",
    gap: 8,
  },
  cameraIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  tapText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  tapHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },

  // Tag pill
  tagPill: {
    position: "absolute",
    top: 10,
    left: 10,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    letterSpacing: 0.5,
  },

  // Saved badge
  savedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: T.lime + "22",
    borderWidth: 1,
    borderColor: T.lime + "50",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  savedText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 9,
    color: T.lime,
    letterSpacing: 1.2,
  },

  // Label pill at bottom
  labelPill: {
    position: "absolute",
    bottom: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  labelText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    letterSpacing: 1.5,
  },

  // VS divider
  vsDivider: {
    width: 10,
    height: PHOTO_H,
    alignItems: "center",
    justifyContent: "center",
  },
  vsLine: {
    width: 1,
    flex: 1,
    backgroundColor: T.borderMid,
  },
  vsCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  vsText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 7,
    color: T.muted,
    letterSpacing: 0.5,
  },

  // ── Footer stats ──────────────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: T.border,
  },
  statVal: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
    color: T.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.5,
  },
});
